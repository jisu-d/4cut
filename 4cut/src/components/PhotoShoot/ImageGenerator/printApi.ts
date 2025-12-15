// 프린트 API 관련 타입 정의 및 함수들을 포함하는 파일입니다.

// 프린트 요청 후 서버 응답의 예상 구조를 정의하는 인터페이스
export interface PrintResponse {
  msg: string;        // 응답 메시지 (예: 'success')
  image_url: string;  // QR 코드 이미지의 URL
}

/**
 * 이미지 프린트 요청을 서버로 전송하는 비동기 함수
 * Base64 인코딩된 이미지 데이터와 프린트 수량을 받아 서버에 application/json 형식으로 전송합니다.
 * @param printCount - 인쇄할 이미지의 수량
 * @param base64Data - 캔버스에서 추출한 Base64 인코딩된 이미지 데이터 (data:image/jpeg;base64,...)
 * @returns Promise<string> - 성공 시 서버에서 반환된 QR 코드 이미지 URL
 * @throws Error - 네트워크 문제, 서버 응답 에러 또는 데이터 형식 오류 시 예외 발생
 */
export const printImage = async (printCount: number, base64Data: string): Promise<string> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/printImgs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        printoutNum: printCount,
        base64_data: base64Data
      }),
    });

    if (!response.ok) {
      throw new Error('서버 응답 에러');
    }

    const data: PrintResponse = await response.json();

    if (data.image_url) {
      return data.image_url;
    } else {
      throw new Error('데이터 형식이 올바르지 않습니다. (image_url 없음)');
    }
  } catch (error) {
    console.error("프린트 요청 실패:", error);
    throw new Error((error as Error).message || '서버 응답 없음');
  }
};
