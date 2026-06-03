"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, TYPE_VOCAB_LABELS } from "@/consts";
import { addLocalVocabulary, updateLocalVocabulary } from "@/lib/localStorage";
import { VocabularyType } from "@/types/vocabulary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  word: z.string().min(1, { message: "Từ vựng không được để trống" }),
  type: z.string().min(1, { message: "Loại từ không được để trống" }),
  meaning: z.string().min(1, { message: "Nghĩa của từ không được để trống" }),
  status: z.enum(["to_learn", "learning", "mastered"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VocabularyFormProps {
  vocabulary?: VocabularyType;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VocabularyForm({
  vocabulary,
  onSuccess,
  open,
  onOpenChange,
}: VocabularyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!vocabulary;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
      type: "",
      meaning: "",
      status: "to_learn",
    },
  });

  useEffect(() => {
    if (isEditing && vocabulary) {
      form.reset({
        word: vocabulary.word,
        type: vocabulary.type,
        meaning: vocabulary.meaning,
        status: vocabulary.status,
      });
    } else {
      form.reset({
        word: "",
        type: "",
        meaning: "",
        status: "to_learn",
      });
    }
  }, [isEditing, vocabulary, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing && vocabulary) {
        updateLocalVocabulary({
          ...vocabulary,
          ...values,
        });
      } else {
        addLocalVocabulary({ ...values, status: "to_learn", level: 0 });
      }

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving vocabulary:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Cập nhật từ vựng" : "Thêm từ vựng mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Từ vựng</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập từ vựng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại từ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại từ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TYPE_VOCAB_LABELS.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meaning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nghĩa của từ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập nghĩa của từ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditing && (<FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />)}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Đang lưu..."
                  : isEditing
                  ? "Cập nhật"
                  : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
