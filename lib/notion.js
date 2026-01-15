const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function createMeetingPage(data) {
  try {
    const {
      title,
      executive_summary,
      meeting_overview,
      discussion_points,
      decisions,
      next_actions,
      tags,
      date,
      participants
    } = data;

    // Construct blocks for the body
    const children = [];

    // 1. Executive Summary
    if (executive_summary) {
      children.push({
        heading_2: { rich_text: [{ text: { content: "1. Executive Summary (핵심 요약)" } }] }
      });
      children.push({
        paragraph: { rich_text: [{ text: { content: executive_summary } }] }
      });
      children.push({ divider: {} });
    }

    // 2. Meeting Overview
    if (meeting_overview) {
      children.push({
        heading_2: { rich_text: [{ text: { content: "2. 미팅 개요" } }] }
      });
      children.push({
        paragraph: { rich_text: [{ text: { content: meeting_overview } }] }
      });
      children.push({ divider: {} });
    }

    // 3. Discussion Points
    if (discussion_points && discussion_points.length > 0) {
      children.push({
        heading_2: { rich_text: [{ text: { content: "3. 주요 논의 내용" } }] }
      });
      discussion_points.forEach((point, index) => {
        // e.g., 3.1 Topic
        const headingText = point.heading.startsWith(index + 1) ? point.heading : `3.${index + 1} ${point.heading}`;

        children.push({
          heading_3: { rich_text: [{ text: { content: headingText } }] }
        });

        if (Array.isArray(point.details)) {
          point.details.forEach(detail => {
            children.push({
              bulleted_list_item: { rich_text: [{ text: { content: detail } }] }
            });
          });
        } else if (typeof point.details === 'string') {
          children.push({
            paragraph: { rich_text: [{ text: { content: point.details } }] }
          });
        }
      });
      children.push({ divider: {} });
    }

    // 4. Decisions
    if (decisions && decisions.length > 0) {
      children.push({
        heading_2: { rich_text: [{ text: { content: "4. 결정 사항" } }] }
      });
      decisions.forEach(decision => {
        children.push({
          bulleted_list_item: { rich_text: [{ text: { content: decision } }] }
        });
      });
      children.push({ divider: {} });
    }

    // 5. Next Actions
    if (next_actions && next_actions.length > 0) {
      children.push({
        heading_2: { rich_text: [{ text: { content: "5. Next Action" } }] }
      });
      next_actions.forEach(item => {
        const text = `[${item.assignee || '담당자 미정'}] ${item.task} (기한: ${item.due_date || '미정'})`;
        children.push({
          to_do: {
            rich_text: [{ text: { content: text } }],
            checked: false
          }
        });
      });
    }

    // Prepare properties - Only Name (Title) field
    const properties = {
      Name: {
        title: [
          {
            text: {
              content: title || "제목 없는 회의",
            },
          },
        ],
      },
    };

    // Create the page
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: properties,
      children: children,
    });

    return response;
  } catch (error) {
    console.error("Error creating Notion page:", error);
    throw error;
  }
}

module.exports = { createMeetingPage };
