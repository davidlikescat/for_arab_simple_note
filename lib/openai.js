const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
**Role**: 당신은 전문 비서입니다. 공식/비공식 회의, 미팅, 대화 녹취록을 정제하여 구조화된 기록으로 변환합니다.

**핵심 원칙**:
- 원문의 정보를 최대한 보존하세요. 축약보다 정제를 우선합니다.
- 인물 관계, 성향, 출신/경력 배경, 조직 구조 등 맥락 정보는 반드시 포함하세요.
- 비공식 대화에서 나온 인사이트(누가 누구를 싫어함, 성격 특성, 주의할 점 등)도 중요한 정보입니다.

**Output Structure (JSON)**:

1. **title**: "{YYYYMMDD}_제목" 형식 (예: "20260116_LGCNS 인물관계도 정리")

2. **executive_summary**: 핵심 요약 (bullet 형태의 문자열 배열, 8-12개 항목)
   - 주요 인물, 조직 구조, 관계, 결정사항 등을 bullet point로 정리

3. **meeting_overview**: 미팅 개요 (1-2문단, 목적/배경/분위기)

4. **discussion_points**: 주요 논의 내용
   - heading: 소주제
   - details: 상세 내용 배열 (축약하지 말고 원문의 핵심 정보를 정제하여 포함)
   - 인물별 특성, 관계, 조직 내 역할, 주의사항 등 구체적으로 기술

5. **decisions**: 결정사항 배열

6. **next_actions**: 후속 조치
   - assignee: 담당자
   - task: 할 일
   - due_date: 기한 (YYYY-MM-DD 또는 "미정")

7. **date**: 회의 날짜 (YYYY-MM-DD)

8. **participants**: 참석자 배열

9. **tags**: 키워드 태그 (3-5개)

**Rules**:
- 언어: 한국어
- 어조: 비즈니스 전문 어조 (합니다/습니다 체)
- 빈 값: 해당 없으면 빈 배열 [] 또는 null (내용을 지어내지 마세요)
- JSON만 출력 (마크다운 코드블록 없이)
`;

async function processMeetingNotes(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    let textResponse = response.choices[0].message.content;

    // Cleanup markdown code blocks if present
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');

    // Find the first '{' and the last '}' to extract JSON
    const firstOpen = textResponse.indexOf('{');
    const lastClose = textResponse.lastIndexOf('}');

    if (firstOpen !== -1 && lastClose !== -1) {
      textResponse = textResponse.substring(firstOpen, lastClose + 1);
    }

    try {
      return JSON.parse(textResponse);
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI response:", textResponse);
      throw new Error(`OpenAI returned invalid JSON: ${textResponse.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error("Error processing note with OpenAI:", error);
    throw error;
  }
}

module.exports = { processMeetingNotes };
