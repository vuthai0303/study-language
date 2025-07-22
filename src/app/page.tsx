import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-10">
        Chào mừng đến với StudyLanguage
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Học từ vựng</CardTitle>
            <CardDescription>Lưu trữ và học từ vựng tiếng Anh</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Tạo danh sách từ vựng của riêng bạn và kiểm tra kiến thức của mình
              thông qua các bài tập trắc nghiệm.
            </p>
            <Link href="/vocabulary">
              <Button>Bắt đầu học từ vựng</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Học viết</CardTitle>
            <CardDescription>
              Luyện tập dịch từ tiếng Việt sang tiếng Anh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Chọn chủ đề, nhận đoạn văn tiếng Việt và thực hành dịch sang tiếng
              Anh với sự hỗ trợ của AI.
            </p>
            <Link href="/writing">
              <Button>Bắt đầu học viết</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Học ngữ pháp</CardTitle>
            <CardDescription>
              Luyện tập các chủ điểm ngữ pháp tiếng Anh với câu hỏi trắc nghiệm
              AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Chọn các chủ điểm ngữ pháp bạn muốn luyện tập và làm bài kiểm tra
              trắc nghiệm do AI tạo ra.
            </p>
            <Link href="/grammar">
              <Button>Bắt đầu học ngữ pháp</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Luyện đọc</CardTitle>
            <CardDescription>Luyện tập khả năng đọc tiếng anh</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Thực hành các bài tập để luyện tập khả năng đọc tiếng anh
            </p>
            <Link href="/reading">
              <Button>Bắt đầu luyện đọc</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
