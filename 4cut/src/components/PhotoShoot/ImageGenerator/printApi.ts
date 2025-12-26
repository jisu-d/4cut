// 프린트 API 관련 타입 정의 및 함수들을 포함하는 파일입니다.

// 프린트 요청 후 서버 응답의 예상 구조를 정의하는 인터페이스
export interface PrintResponse {
  msg: string;        // 응답 메시지 (예: 'success')
  image_url: string;  // QR 코드 이미지의 URL
}

/**
 * 이미지 프린트 요청을 서버로 전송하는 비동기 함수
 * Blob 형태의 정적 이미지와 GIF 이미지를 받아 FormData로 전송합니다.
 * @param printCount - 인쇄할 이미지의 수량
 * @param staticBlob - 정적 이미지 Blob (image/jpeg)
 * @param gifBlob - GIF 이미지 Blob (image/gif)
 * @returns Promise<string> - 성공 시 서버에서 반환된 QR 코드 이미지 URL
 */
export const printImage = async (printCount: number, staticBlob: Blob, gifBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('print_count', printCount.toString());
    formData.append('static_file', staticBlob, 'photo.jpg');
    formData.append('gif_file', gifBlob, 'photo.gif');

    const response = await fetch('https://10.42.0.1:8000/printImgs', {
      method: 'POST',
      body: formData, // FormData 사용 시 Content-Type 헤더는 자동 설정됨
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
