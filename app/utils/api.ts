// app/utils/api.ts

// 1. 입력받을 데이터 모양 정의
interface MessageRequest {
  target: string;
  situation: string;
}

// 2. 응답받을 데이터 모양 정의
interface MessageResponse {
  messages: string[];
}

// 3. 가짜 API 함수 (나중에 진짜 서버 주소로 바꿀 예정)
export const generateMessage = async (data: MessageRequest): Promise<MessageResponse> => {
  console.log("서버로 보낼 데이터:", data); // 확인용 로그

  // 실제 서버 통신 대신, 1초 기다렸다가 가짜 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: [
          `(테스트) ${data.target}님, ${data.situation}이라서 연락드렸어요! 항상 건강하세요.`,
          `(테스트) ${data.target}님, 사랑합니다!`,
          `(테스트) 날씨가 춥네요. 감기 조심하세요!`
        ],
      });
    }, 1000); // 1초 딜레이 (로딩바 확인용)
  });
};