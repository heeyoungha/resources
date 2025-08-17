import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            인증 오류
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            이메일 인증 중 문제가 발생했습니다.
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                다음 이유로 인증이 실패할 수 있습니다:
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2">
                <li>• 이메일 링크가 만료되었습니다</li>
                <li>• 이미 사용된 링크입니다</li>
                <li>• 잘못된 인증 코드입니다</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                홈으로 돌아가기
              </Link>
              <p className="text-center text-sm text-gray-500">
                다시 시도하려면 새로운 인증 링크를 요청하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 