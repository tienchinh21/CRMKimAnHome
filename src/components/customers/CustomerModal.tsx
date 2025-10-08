import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CustomerService, { type Customer } from "@/services/api/CustomerService";
import CoreEnumService from "@/services/api/CoreEnumService";
import type { CoreEnum } from "@/types";
import ProjectService from "@/services/api/ProjectService";
import { toast } from "sonner";

// Validation schema
const customerSchema = z.object({
  fullName: z.string().min(1, "Tên khách hàng là bắt buộc"),
  phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  sourcesId: z.string().min(1, "Nguồn khách hàng là bắt buộc"),
  demandId: z.string().min(1, "Nhu cầu là bắt buộc"),
  projectId: z.string().min(1, "Dự án là bắt buộc"),
  pipelineId: z.string().min(1, "Pipeline là bắt buộc"),
  note: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  customer?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customer,
}) => {
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<CoreEnum[]>([]);
  const [demands, setDemands] = useState<CoreEnum[]>([]);
  const [pipelines, setPipelines] = useState<CoreEnum[]>([]);
  const [projects, setProjects] = useState<CoreEnum[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const watchedValues = watch();

  // Load core enums and projects
  const loadCoreEnums = async () => {
    try {
      const [sourcesRes, demandsRes, pipelinesRes, projectsRes] =
        await Promise.all([
          CoreEnumService.getByType("sources"),
          CoreEnumService.getByType("demand"),
          CoreEnumService.getByType("pipeline"),
          ProjectService.getAllProjects(),
        ]);

      setSources(sourcesRes.data || []);
      setDemands(demandsRes.data || []);
      setPipelines(pipelinesRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error("Error loading core enums:", error);
      toast.error("Không thể tải dữ liệu tham chiếu");
    }
  };

  // Helper function to find ID by name
  const findIdByName = (name: string, items: CoreEnum[]) => {
    const item = items.find((item) => item.name === name);
    return item ? item.id : "";
  };

  // Helper function to find project ID by name
  const findProjectIdByName = (name: string, projects: any[]) => {
    const project = projects.find((project) => project.name === name);
    return project ? project.id : "";
  };

  // Load customer data for editing
  useEffect(() => {
    if (customer) {
      setValue("fullName", customer.fullName);
      setValue("phoneNumber", customer.phoneNumber);

      // Try to use ID first, fallback to finding ID by name
      setValue(
        "sourcesId",
        customer.sourcesId || findIdByName(customer.sourcesName || "", sources)
      );
      setValue(
        "demandId",
        customer.demandId || findIdByName(customer.demandName || "", demands)
      );
      setValue(
        "projectId",
        customer.projectId ||
          findProjectIdByName(customer.projectName || "", projects)
      );
      setValue(
        "pipelineId",
        customer.pipelineId ||
          findIdByName(customer.pipelineName || "", pipelines)
      );
      setValue("note", customer.note || "");
    } else {
      reset();
    }
  }, [customer, setValue, reset, sources, demands, pipelines]);

  // Load core enums when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCoreEnums();
    }
  }, [isOpen]);

  // Set form values after core enums are loaded
  useEffect(() => {
    if (
      customer &&
      sources.length > 0 &&
      demands.length > 0 &&
      pipelines.length > 0 &&
      projects.length > 0
    ) {
      setValue(
        "sourcesId",
        customer.sourcesId || findIdByName(customer.sourcesName || "", sources)
      );
      setValue(
        "demandId",
        customer.demandId || findIdByName(customer.demandName || "", demands)
      );
      setValue(
        "projectId",
        customer.projectId ||
          findProjectIdByName(customer.projectName || "", projects)
      );
      setValue(
        "pipelineId",
        customer.pipelineId ||
          findIdByName(customer.pipelineName || "", pipelines)
      );
    }
  }, [customer, sources, demands, pipelines, projects, setValue]);

  // Handle form submission
  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    try {
      if (customer) {
        // Update existing customer
        await CustomerService.update({
          id: customer.id,
          ...data,
          note: data.note || "",
        });
        toast.success("Cập nhật khách hàng thành công");
      } else {
        // Create new customer
        await CustomerService.create({
          ...data,
          note: data.note || "",
        });
        toast.success("Tạo khách hàng thành công");
      }
      onSave();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(
        customer ? "Không thể cập nhật khách hàng" : "Không thể tạo khách hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Tên khách hàng *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Nhập tên khách hàng"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  placeholder="Nhập số điện thoại"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin kinh doanh</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sources */}
              <div className="space-y-2">
                <Label htmlFor="sourcesId">Nguồn khách hàng *</Label>
                <Select
                  value={watchedValues.sourcesId}
                  onValueChange={(value) => setValue("sourcesId", value)}
                >
                  <SelectTrigger
                    className={errors.sourcesId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn nguồn khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sourcesId && (
                  <p className="text-sm text-red-600">
                    {errors.sourcesId.message}
                  </p>
                )}
              </div>

              {/* Demand */}
              <div className="space-y-2">
                <Label htmlFor="demandId">Nhu cầu *</Label>
                <Select
                  value={watchedValues.demandId}
                  onValueChange={(value) => setValue("demandId", value)}
                >
                  <SelectTrigger
                    className={errors.demandId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn nhu cầu" />
                  </SelectTrigger>
                  <SelectContent>
                    {demands.map((demand) => (
                      <SelectItem key={demand.id} value={demand.id}>
                        {demand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.demandId && (
                  <p className="text-sm text-red-600">
                    {errors.demandId.message}
                  </p>
                )}
              </div>

              {/* Project */}
              <div className="space-y-2">
                <Label htmlFor="projectId">Dự án *</Label>
                <Select
                  value={watchedValues.projectId}
                  onValueChange={(value) => setValue("projectId", value)}
                >
                  <SelectTrigger
                    className={errors.projectId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn dự án" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-red-600">
                    {errors.projectId.message}
                  </p>
                )}
              </div>

              {/* Pipeline */}
              <div className="space-y-2">
                <Label htmlFor="pipelineId">Pipeline *</Label>
                <Select
                  value={watchedValues.pipelineId}
                  onValueChange={(value) => setValue("pipelineId", value)}
                >
                  <SelectTrigger
                    className={errors.pipelineId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pipelineId && (
                  <p className="text-sm text-red-600">
                    {errors.pipelineId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder="Nhập ghi chú về khách hàng"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Đang lưu..."
                : customer
                ? "Cập nhật"
                : "Tạo khách hàng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerModal;
