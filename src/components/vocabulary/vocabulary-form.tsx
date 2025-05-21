"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VocabularyType } from "@/types";
import { addVocabulary, updateVocabulary } from "@/lib/localStorage";

const formSchema = z.object({
  word: z.string().min(1, { message: "Từ vựng không được để trống" }),
  type: z.string().min(1, { message: "Loại từ không được để trống" }),
  meaning: z.string().min(1, { message: "Nghĩa của từ không được để trống" }),
});

type FormValues = z.infer<typeof formSchema>;

interface VocabularyFormProps {
  vocabulary?: VocabularyType;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VocabularyForm({ vocabulary, onSuccess, open, onOpenChange }: VocabularyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!vocabulary;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: vocabulary?.word || "",
      type: vocabulary?.type || "",
      meaning: vocabulary?.meaning || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && vocabulary) {
        updateVocabulary({
          ...vocabulary,
          ...values,
        });
      } else {
        addVocabulary(values);
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
          <DialogTitle>{isEditing ? "Cập nhật từ vựng" : "Thêm từ vựng mới"}</DialogTitle>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại từ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="noun">Danh từ (Noun)</SelectItem>
                      <SelectItem value="verb">Động từ (Verb)</SelectItem>
                      <SelectItem value="adjective">Tính từ (Adjective)</SelectItem>
                      <SelectItem value="adverb">Trạng từ (Adverb)</SelectItem>
                      <SelectItem value="preposition">Giới từ (Preposition)</SelectItem>
                      <SelectItem value="conjunction">Liên từ (Conjunction)</SelectItem>
                      <SelectItem value="pronoun">Đại từ (Pronoun)</SelectItem>
                      <SelectItem value="phrase">Cụm từ (Phrase)</SelectItem>
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
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}