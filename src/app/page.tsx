import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Chào mừng đến với StudyLanguage</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Học từ vựng</CardTitle>
            <CardDescription>Lưu trữ và học từ vựng tiếng Anh</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Tạo danh sách từ vựng của riêng bạn và kiểm tra kiến thức của mình thông qua các bài tập trắc nghiệm.
            </p>
            <Link href="/vocabulary">
              <Button>Bắt đầu học từ vựng</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Học viết</CardTitle>
            <CardDescription>Luyện tập dịch từ tiếng Việt sang tiếng Anh</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Chọn chủ đề, nhận đoạn văn tiếng Việt và thực hành dịch sang tiếng Anh với sự hỗ trợ của AI.
            </p>
            <Link href="/writing">
              <Button>Bắt đầu học viết</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
