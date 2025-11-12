// Monday.com API Integration Module
// Handles authentication, GraphQL queries, and file uploads

export class MondayAPI {
  constructor() {
    this.token = null;
    this.apiUrl = 'https://api.monday.com/v2';
  }

  setToken(token) {
    this.token = token;
  }

  async query(query, variables = {}) {
    if (!this.token) {
      throw new Error('Monday.com token not set');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token,
        'API-Version': '2024-01'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Monday API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`Monday GraphQL error: ${result.errors[0].message}`);
    }

    return result.data;
  }

  async fetchWorkspaces() {
    const query = `
      query {
        boards {
          id
          name
          workspace {
            id
            name
          }
          groups {
            id
            title
          }
        }
      }
    `;

    const data = await this.query(query);
    return data.boards;
  }

  async fetchRecentItems(boardId, groupId, limit = 10) {
    const query = `
      query ($boardId: [ID!]!, $limit: Int!) {
        boards(ids: $boardId) {
          groups(ids: ["${groupId}"]) {
            items_page(limit: $limit) {
              items {
                id
                name
                created_at
                updated_at
                column_values {
                  id
                  text
                  value
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, { 
      boardId: [boardId], 
      limit 
    });

    if (data.boards && data.boards[0] && data.boards[0].groups[0]) {
      return data.boards[0].groups[0].items_page.items;
    }

    return [];
  }

  async createBugItem(boardId, groupId, bugData, attachments = []) {
    // First create the item with description in the item name
    // We'll add detailed info as an update since column values can be complex
    const bugTitle = bugData.description || 'New Bug';
    
    const createQuery = `
      mutation ($boardId: ID!, $groupId: String!, $itemName: String!) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName
        ) {
          id
          name
          url
        }
      }
    `;

    const result = await this.query(createQuery, {
      boardId: boardId,
      groupId: groupId,
      itemName: bugTitle
    });

    const item = result.create_item;

    // Add bug details as an update (post)
    try {
      await this.addBugDetailsUpdate(item.id, bugData);
    } catch (error) {
      console.error('Failed to add bug details:', error);
      // Continue anyway - item was created
    }

    // Attach files to the update (this is more reliable than column attachments)
    if (attachments && attachments.length > 0) {
      try {
        await this.addFilesToItem(item.id, attachments);
      } catch (error) {
        console.error('Failed to attach files:', error);
        // Continue anyway - item was created
      }
    }

    return item;
  }

  async addBugDetailsUpdate(itemId, bugData) {
    // Format bug details as markdown-style text
    let updateText = '';
    
    if (bugData.platform) {
      updateText += `**Platform:** ${bugData.platform}\n`;
    }
    if (bugData.env) {
      updateText += `**Environment:** ${bugData.env}\n`;
    }
    if (bugData.version) {
      updateText += `**Version:** ${bugData.version}\n`;
    }
    
    updateText += `\n**Description:**\n${bugData.description || 'N/A'}\n`;
    
    if (bugData.stepsToReproduce) {
      updateText += `\n**Steps to Reproduce:**\n${bugData.stepsToReproduce}\n`;
    }
    if (bugData.actualResult) {
      updateText += `\n**Actual Result:**\n${bugData.actualResult}\n`;
    }
    if (bugData.expectedResult) {
      updateText += `\n**Expected Result:**\n${bugData.expectedResult}\n`;
    }

    const mutation = `
      mutation ($itemId: ID!, $body: String!) {
        create_update(
          item_id: $itemId,
          body: $body
        ) {
          id
        }
      }
    `;

    await this.query(mutation, {
      itemId: itemId,
      body: updateText
    });
  }

  buildColumnValues(bugData) {
    // Map bug data fields to Monday column values
    // This is a simplified version - actual implementation depends on board structure
    const values = {};

    // Example mapping (adjust based on actual Monday board columns)
    if (bugData.platform) {
      values.platform = { text: bugData.platform };
    }
    if (bugData.env) {
      values.environment = { text: bugData.env };
    }
    if (bugData.version) {
      values.version = { text: bugData.version };
    }

    // Long text fields
    if (bugData.description) {
      values.description = { text: bugData.description };
    }
    if (bugData.stepsToReproduce) {
      values.steps = { text: bugData.stepsToReproduce };
    }
    if (bugData.actualResult) {
      values.actual = { text: bugData.actualResult };
    }
    if (bugData.expectedResult) {
      values.expected = { text: bugData.expectedResult };
    }

    return values;
  }

  async addFilesToItem(itemId, files) {
    // Monday.com file uploads work by adding files to updates
    // First create an update, then attach files to it
    
    // Create a simple update to attach files to
    const createUpdateMutation = `
      mutation ($itemId: ID!) {
        create_update(
          item_id: $itemId,
          body: "Attachments"
        ) {
          id
        }
      }
    `;

    const updateResult = await this.query(createUpdateMutation, {
      itemId: itemId
    });

    const updateId = updateResult.create_update.id;

    // Now attach files to this update
    // Note: Monday.com API has limitations on file uploads
    // In production, you might need a backend proxy
    for (const file of files) {
      try {
        await this.uploadFileToUpdate(updateId, file);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        // Continue with other files
      }
    }
  }

  async uploadFileToUpdate(updateId, file) {
    // Convert data URL to blob
    const blob = await this.dataUrlToBlob(file.dataUrl);
    
    // Use Monday.com asset upload API
    // Note: This is a simplified version. Monday's file upload API
    // may require different handling depending on your account setup
    const formData = new FormData();
    formData.append('query', `
      mutation ($updateId: ID!, $file: File!) {
        add_file_to_update(
          update_id: $updateId,
          file: $file
        ) {
          id
        }
      }
    `);
    formData.append('variables', JSON.stringify({ updateId }));
    formData.append('file', blob, file.name);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': this.token
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('File upload response:', errorText);
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('File upload GraphQL errors:', result.errors);
      throw new Error(`File upload error: ${result.errors[0].message}`);
    }

    return result;
  }

  async dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  // Test connection by fetching user info
  async testConnection() {
    const query = `
      query {
        me {
          id
          name
          email
        }
      }
    `;

    const data = await this.query(query);
    return data.me;
  }
}
