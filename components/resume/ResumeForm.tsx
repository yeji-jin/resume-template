"use client";

import { Fragment, type ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type Control,
} from "react-hook-form";
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhotoUpload from "./PhotoUpload";
import { currentMonth, uid } from "@/lib/resume/utils";
import type { ResumeData } from "@/lib/resume/types";

export default function ResumeForm() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ResumeData>();

  const experiences = useFieldArray({ control, name: "experiences", keyName: "fieldId" });
  const educations = useFieldArray({ control, name: "educations", keyName: "fieldId" });
  const skills = useFieldArray({ control, name: "skills", keyName: "fieldId" });
  const projects = useFieldArray({ control, name: "projects", keyName: "fieldId" });

  return (
    <div className="space-y-10">
      {/* 인적사항 */}
      <FormSection title="인적사항">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Controller
            control={control}
            name="photo"
            render={({ field }) => (
              <PhotoUpload value={field.value} onChange={field.onChange} />
            )}
          />
          <div className="grid flex-1 grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field label="이름" required error={errors.name?.message}>
              <Input placeholder="홍길동" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="연락처" required error={errors.phone?.message}>
              <Input
                placeholder="010-0000-0000"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </Field>
            <Field label="이메일" error={errors.email?.message}>
              <Input
                placeholder="example@email.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>
            <Field label="생년월일">
              <Input placeholder="1997.04.25" {...register("birth")} />
            </Field>
            <Field label="주소" className="sm:col-span-2">
              <Input placeholder="경기도 용인시" {...register("address")} />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* 자기소개 */}
      <FormSection title="자기소개">
        <SummaryTextarea control={control} />
      </FormSection>

      {/* 경력 */}
      <FormSection
        title="경력"
        onAdd={() =>
          experiences.append({
            id: uid("exp"),
            company: "",
            team: "",
            role: "",
            start: "",
            end: "",
            description: "",
          })
        }
      >
        {experiences.fields.length === 0 && <EmptyHint />}
        <SortableSection
          items={experiences.fields}
          onReorder={experiences.move}
          renderItem={(field, i) => (
            <ItemCard
              id={field.fieldId}
              index={i}
              total={experiences.fields.length}
              onMove={(dir) => experiences.move(i, i + dir)}
              onRemove={() => experiences.remove(i)}
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field label="회사명">
                  <Input {...register(`experiences.${i}.company`)} />
                </Field>
                <Field label="부서/팀">
                  <Input {...register(`experiences.${i}.team`)} />
                </Field>
                <Field label="직무">
                  <Input {...register(`experiences.${i}.role`)} />
                </Field>
                <ExperiencePeriodFields control={control} index={i} />
              </div>
              <Field label="담당 업무 / 성과" className="mt-4">
                <Textarea rows={4} {...register(`experiences.${i}.description`)} />
              </Field>
            </ItemCard>
          )}
        />
      </FormSection>

      {/* 학력 */}
      <FormSection
        title="학력"
        onAdd={() =>
          educations.append({
            id: uid("edu"),
            school: "",
            major: "",
            degree: "",
            status: "",
            gpa: "",
            start: "",
            end: "",
          })
        }
      >
        {educations.fields.length === 0 && <EmptyHint />}
        <SortableSection
          items={educations.fields}
          onReorder={educations.move}
          renderItem={(field, i) => (
            <ItemCard
              id={field.fieldId}
              index={i}
              total={educations.fields.length}
              onMove={(dir) => educations.move(i, i + dir)}
              onRemove={() => educations.remove(i)}
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field label="학교명">
                  <Input {...register(`educations.${i}.school`)} />
                </Field>
                <Field label="전공">
                  <Input {...register(`educations.${i}.major`)} />
                </Field>
                <Field label="구분">
                  <Input placeholder="대학교(4년)" {...register(`educations.${i}.degree`)} />
                </Field>
                <Field label="상태">
                  <Input placeholder="졸업 / 재학" {...register(`educations.${i}.status`)} />
                </Field>
                <Field label="학점">
                  <Input placeholder="4.5/4.5" {...register(`educations.${i}.gpa`)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="입학">
                    <Input type="month" {...register(`educations.${i}.start`)} />
                  </Field>
                  <Field label="졸업">
                    <Input type="month" {...register(`educations.${i}.end`)} />
                  </Field>
                </div>
              </div>
            </ItemCard>
          )}
        />
      </FormSection>

      {/* 보유 스킬 */}
      <FormSection
        title="보유 스킬"
        onAdd={() => skills.append({ id: uid("sk"), name: "", level: "중" })}
      >
        {skills.fields.length === 0 && <EmptyHint />}
        <div className="space-y-4">
          {skills.fields.map((field, i) => (
            <div key={field.fieldId} className="flex items-end gap-3">
              <Field label="스킬명" className="flex-1">
                <Input placeholder="프론트엔드" {...register(`skills.${i}.name`)} />
              </Field>
              <Field label="수준" className="w-28">
                <Controller
                  control={control}
                  name={`skills.${i}.level`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="상">상</SelectItem>
                        <SelectItem value="중">중</SelectItem>
                        <SelectItem value="하">하</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => skills.remove(i)}
                className="mb-1 h-[42px] w-[42px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="스킬 삭제"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </FormSection>

      {/* 프로젝트 */}
      <FormSection
        title="프로젝트"
        onAdd={() =>
          projects.append({ id: uid("prj"), name: "", start: "", end: "", description: "" })
        }
      >
        {projects.fields.length === 0 && <EmptyHint />}
        <SortableSection
          items={projects.fields}
          onReorder={projects.move}
          renderItem={(field, i) => (
            <ItemCard
              id={field.fieldId}
              index={i}
              total={projects.fields.length}
              onMove={(dir) => projects.move(i, i + dir)}
              onRemove={() => projects.remove(i)}
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field label="프로젝트명">
                  <Input {...register(`projects.${i}.name`)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="시작">
                    <Input type="month" {...register(`projects.${i}.start`)} />
                  </Field>
                  <Field label="종료">
                    <Input type="month" {...register(`projects.${i}.end`)} />
                  </Field>
                </div>
              </div>
              <Field label="설명" className="mt-4">
                <Textarea rows={3} {...register(`projects.${i}.description`)} />
              </Field>
            </ItemCard>
          )}
        />
      </FormSection>
    </div>
  );
}

/* ───────── 자기소개 글자수 표시 ───────── */
function SummaryTextarea({ control }: { control: Control<ResumeData> }) {
  const { register } = useFormContext<ResumeData>();
  const value = useWatch({ control, name: "summary" }) ?? "";
  return (
    <div>
      <Textarea
        rows={6}
        placeholder="본인의 강점과 지향점을 자유롭게 작성하세요."
        {...register("summary")}
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">
        공백 포함 {value.length}자
      </p>
    </div>
  );
}

/* ───────── 경력 시작/종료 + 재직중 체크박스 ───────── */
function ExperiencePeriodFields({
  control,
  index,
}: {
  control: Control<ResumeData>;
  index: number;
}) {
  const { register, setValue } = useFormContext<ResumeData>();
  const start = useWatch({ control, name: `experiences.${index}.start` });
  const end = useWatch({ control, name: `experiences.${index}.end` });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="시작">
          <Input type="month" {...register(`experiences.${index}.start`)} />
        </Field>
        <Field label="종료">
          <Input type="month" disabled={end === ""} {...register(`experiences.${index}.end`)} />
        </Field>
      </div>
      <label className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={end === ""}
          onChange={(e) =>
            setValue(
              `experiences.${index}.end`,
              e.target.checked ? "" : start || currentMonth(),
              { shouldDirty: true }
            )
          }
          className="accent-primary"
        />
        재직중
      </label>
    </div>
  );
}

/* ───────── 재사용 폼 UI ───────── */
function FormSection({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd?: () => void;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {onAdd && (
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus size={15} /> 추가
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

/** 경력/학력/프로젝트 목록에 드래그 앤 드롭 순서 변경을 적용하는 컨테이너 */
function SortableSection<T extends { fieldId: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (from: number, to: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.fieldId === active.id);
    const newIndex = items.findIndex((item) => item.fieldId === over.id);
    if (oldIndex !== -1 && newIndex !== -1) onReorder(oldIndex, newIndex);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((item) => item.fieldId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-5">
          {items.map((item, i) => (
            <Fragment key={item.fieldId}>{renderItem(item, i)}</Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function ItemCard({
  id,
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  id: string;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative rounded-xl border bg-muted/40 p-5 pt-12 ${
        isDragging ? "z-10 opacity-80 shadow-lg" : ""
      }`}
    >
      <div className="absolute right-3 top-3 flex items-center gap-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-muted-foreground touch-none active:cursor-grabbing"
          aria-label="드래그하여 순서 변경"
        >
          <GripVertical size={16} />
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="h-8 w-8 text-muted-foreground"
          aria-label="위로 이동"
        >
          <ChevronUp size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="h-8 w-8 text-muted-foreground"
          aria-label="아래로 이동"
        >
          <ChevronDown size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="항목 삭제"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <span className="absolute left-5 top-4 text-xs font-semibold text-muted-foreground">
        #{index + 1}
      </span>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function EmptyHint() {
  return (
    <p className="mb-4 rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
      &apos;추가&apos; 버튼으로 항목을 등록하세요.
    </p>
  );
}
