import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import BonusService from "@/services/api/BonusService";
import UserService from "@/services/api/UserService";
import type { Bonus } from "@/types/bonus";
import type { UserResponse } from "@/types";
import BonusModal from "@/components/bonuses/BonusModal";
import Breadcrumb from "@/components/common/breadcrumb";
import { formatCurrency, formatDateTime } from "@/utils/format";

const BonusList: React.FC = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined
  );
  const [userIdFilter, setUserIdFilter] = useState<string>("all");
  const [users, setUsers] = useState<UserResponse[]>([]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const response = await UserService.getAll({
        pageable: { page: 0, size: 1000 },
      });
      const usersData =
        response.data?.content?.response ||
        response.data?.response ||
        response.data?.content ||
        [];
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Không thể tải danh sách nhân viên");
    }
  }, []);

  // Load bonuses
  const loadBonuses = useCallback(async () => {
    setLoading(true);
    try {
      const filter = BonusService.buildFilter({
        search: searchTerm,
        startDate: startDateFilter
          ? format(startDateFilter, "yyyy-MM-dd")
          : undefined,
        endDate: endDateFilter
          ? format(endDateFilter, "yyyy-MM-dd")
          : undefined,
        userId: userIdFilter !== "all" ? userIdFilter : undefined,
      });

      const response = await BonusService.getAll(filter || undefined);
      setBonuses(response.content.response || []);
    } catch (error) {
      console.error("Error loading bonuses:", error);
      toast.error("Không thể tải danh sách lương thưởng");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, startDateFilter, endDateFilter, userIdFilter]);

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadBonuses();
  }, []);

  // Auto-apply filters with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBonuses();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, userIdFilter, startDateFilter, endDateFilter, loadBonuses]);

  // Handle create
  const handleCreate = useCallback(() => {
    setEditingBonus(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((bonus: Bonus) => {
    setEditingBonus(bonus);
    setIsModalOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa lương thưởng này?")) return;

      try {
        await BonusService.delete(id);
        toast.success("Xóa lương thưởng thành công!");
        loadBonuses();
      } catch (error) {
        console.error("Error deleting bonus:", error);
        toast.error("Không thể xóa lương thưởng");
      }
    },
    [loadBonuses]
  );

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingBonus(null);
  }, []);

  // Handle modal save
  const handleModalSave = useCallback(() => {
    handleModalClose();
    loadBonuses();
    toast.success(
      editingBonus
        ? "Cập nhật lương thưởng thành công!"
        : "Tạo lương thưởng thành công!"
    );
  }, [editingBonus, handleModalClose, loadBonuses]);

  // Handle filter reset
  const handleFilterReset = useCallback(() => {
    setSearchTerm("");
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setUserIdFilter("all");
  }, []);

  // Handle filter apply
  const handleFilterApply = useCallback(() => {
    loadBonuses();
  }, [loadBonuses]);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Quản lý Lương Thưởng
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Quản lý thông tin lương thưởng của nhân viên
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Tạo lương thưởng mới</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm theo tên</Label>
                <Input
                  id="search"
                  placeholder="Nhập tên lương thưởng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userFilter">Nhân viên</Label>
                <Select value={userIdFilter} onValueChange={setUserIdFilter}>
                  <SelectTrigger id="userFilter">
                    <SelectValue placeholder="Tất cả nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhân viên</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDateFilter
                          ? format(startDateFilter, "dd/MM/yyyy")
                          : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDateFilter}
                        onSelect={setStartDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {startDateFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStartDateFilter(undefined)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDateFilter
                          ? format(endDateFilter, "dd/MM/yyyy")
                          : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDateFilter}
                        onSelect={setEndDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {endDateFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEndDateFilter(undefined)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleFilterApply}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Áp dụng
              </Button>
              <Button
                variant="outline"
                onClick={handleFilterReset}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonuses Table */}
      <Card>
        <CardContent className="">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Tên</TableHead>
                    <TableHead className="min-w-[120px]">Số tiền</TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">
                      Ngày bắt đầu
                    </TableHead>
                    <TableHead className="min-w-[100px] hidden md:table-cell">
                      Ngày kết thúc
                    </TableHead>
                    <TableHead className="min-w-[120px] hidden lg:table-cell">
                      Nhân viên
                    </TableHead>
                    <TableHead className="min-w-[120px] hidden xl:table-cell">
                      Cập nhật
                    </TableHead>
                    <TableHead className="min-w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        Chưa có lương thưởng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    bonuses.map((bonus) => (
                      <TableRow key={bonus.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm md:text-base">
                              {bonus.name}
                            </span>
                            <span className="text-xs text-gray-500 md:hidden mt-1">
                              {format(new Date(bonus.startDate), "dd/MM/yyyy")}{" "}
                              - {format(new Date(bonus.endDate), "dd/MM/yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600 text-sm md:text-base">
                            {formatCurrency(bonus.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">
                            {format(new Date(bonus.startDate), "dd/MM/yyyy")}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">
                            {format(new Date(bonus.endDate), "dd/MM/yyyy")}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-gray-600">
                            {bonus.userFullName || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span className="text-sm text-gray-600">
                            {bonus.updatedAt
                              ? formatDateTime(bonus.updatedAt)
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(bonus)}
                              title="Chỉnh sửa"
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(bonus.id)}
                              title="Xóa"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bonus Modal */}
      <BonusModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        bonus={editingBonus}
      />
    </div>
  );
};

export default BonusList;
