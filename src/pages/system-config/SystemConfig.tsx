import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Edit,
  Save,
  X,
  Upload,
  Home,
  HelpCircle,
  RefreshCw,
  Layout,
  ScrollText,
} from "lucide-react";
import SystemConfigService, {
  type SystemConfigDto,
} from "@/services/api/SystemConfigService";
import Breadcrumb from "@/components/common/breadcrumb";
import { toast } from "sonner";

const SystemConfig: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfigDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<SystemConfigDto | null>(
    null
  );
  const [editValue, setEditValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Group configs by section and sort them logically
  const groupedConfigs = React.useMemo(() => {
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.section]) {
        acc[config.section] = [];
      }
      acc[config.section].push(config);
      return acc;
    }, {} as Record<string, SystemConfigDto[]>);

    // Sort configs within each section
    Object.keys(grouped).forEach((section) => {
      grouped[section].sort((a, b) => {
        // Define sorting order for each section
        const getSortOrder = (key: string) => {
          // Homepage sorting
          if (section === "homepage") {
            if (key === "textline") return 1;
            if (key === "background-image") return 2;
            if (key.startsWith("service-div")) return 3;
            if (key.startsWith("achievements-div")) return 4;
            if (key.startsWith("customers-say-div")) return 5;
            return 6;
          }
          // Header sorting
          if (section === "header") {
            if (key === "logo") return 1;
            return 2;
          }
          // Footer sorting
          if (section === "footer") {
            return 1;
          }
          return 0;
        };

        const orderA = getSortOrder(a.key);
        const orderB = getSortOrder(b.key);

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        // If same order, sort by key name
        return a.key.localeCompare(b.key);
      });
    });

    return grouped;
  }, [configs]);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await SystemConfigService.getAll();
      setConfigs(response.content || []);
    } catch (error) {
      console.error("❌ Error loading system configs:", error);
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: SystemConfigDto) => {
    setEditingConfig(config);
    setEditValue(config.value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      await SystemConfigService.update(editingConfig.id, {
        data: {
          section: editingConfig.section,
          key: editingConfig.key,
          value: editValue,
          type: editingConfig.type,
        },
      });

      // Update local state
      setConfigs((prev) =>
        prev.map((config) =>
          config.id === editingConfig.id
            ? { ...config, value: editValue }
            : config
        )
      );

      setIsEditing(false);
      setEditingConfig(null);
      setEditValue("");
      toast.success("Cập nhật cấu hình thành công!");
    } catch (error) {
      console.error("❌ Error updating config:", error);
      toast.error("Không thể cập nhật cấu hình");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingConfig(null);
    setEditValue("");
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editingConfig) return;

    try {
      setUploading(true);
      const subPath = `systemConfig/${editingConfig.id}`;
      const uploadedUrl = await SystemConfigService.uploadFile(file, subPath);

      // Update the config with new image URL
      setEditValue(uploadedUrl);
      toast.success("Tải lên hình ảnh thành công!");
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      toast.error("Không thể tải lên hình ảnh");
    } finally {
      setUploading(false);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "homepage":
        return <Home className="h-5 w-5" />;
      case "header":
        return <Layout className="h-5 w-5" />;
      case "footer":
        return <ScrollText className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "homepage":
        return "Trang chủ";
      case "header":
        return "Header";
      case "footer":
        return "Footer";
      default:
        return section;
    }
  };

  const getSectionDescription = (section: string) => {
    switch (section) {
      case "homepage":
        return "Cấu hình nội dung hiển thị trên trang chủ của website";
      case "header":
        return "Cấu hình phần đầu trang như logo, menu navigation";
      case "footer":
        return "Cấu hình phần chân trang như thông tin liên hệ, links";
      default:
        return "Cấu hình hệ thống";
    }
  };

  const getKeyDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      // Homepage
      textline: "Dòng tiêu đề chính hiển thị trên trang chủ",
      "background-image": "Hình nền của trang chủ",
      "service-div1-text": "Nội dung dịch vụ 1 - Mua bán căn hộ",
      "service-div2-text": "Nội dung dịch vụ 2 - Cho thuê căn hộ",
      "service-div3-text": "Nội dung dịch vụ 3 - Tư vấn pháp lý",
      "service-div4-text": "Nội dung dịch vụ 4 - Đầu tư bất động sản",
      "achievements-div1-text": "Thành tích 1 - Số dự án đã hoàn thành",
      "achievements-div2-text": "Thành tích 2 - Số khách hàng hài lòng",
      "achievements-div3-text": "Thành tích 3 - Số năm kinh nghiệm",
      "achievements-div4-text": "Thành tích 4 - Tỷ lệ hài lòng",
      "customers-say-div1-text": "Đánh giá khách hàng 1",
      "customers-say-div2-text": "Đánh giá khách hàng 2",
      "customers-say-div3-text": "Đánh giá khách hàng 3",
      "customers-say-div4-text": "Đánh giá khách hàng 4",

      // Header
      logo: "Logo của công ty hiển thị trên header",

      // Footer
      "footer-contact-information":
        "Thông tin liên hệ hiển thị trong footer (địa chỉ, số điện thoại, email, giờ làm việc)",
      "footer-slogan": "Slogan và mô tả công ty trong footer",
      "footer-link-facebook": "Link Facebook của công ty",
      "footer-link-zalo": "Link Zalo của công ty",
    };

    return descriptions[key] || `Cấu hình ${key}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Breadcrumb />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Cấu hình Hệ thống
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2">
              Quản lý cấu hình nội dung website và hệ thống
            </p>
          </div>

          <Button onClick={loadConfigs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Help Section */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <HelpCircle className="h-5 w-5" />
              Hướng dẫn sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-2 text-sm">
              <p>
                • <strong>Trang chủ:</strong> Cấu hình nội dung hiển thị trên
                trang chủ
              </p>
              <p>
                • <strong>Header:</strong> Cấu hình phần đầu trang như logo,
                menu
              </p>
              <p>
                • <strong>Footer:</strong> Cấu hình phần chân trang
              </p>
              <p>
                • <strong>Lưu ý:</strong> Chỉ có thể chỉnh sửa giá trị (value),
                không thể thay đổi key và section
              </p>
              <p>
                • <strong>Hình ảnh:</strong> Upload file ảnh để cập nhật hình
                ảnh trên website
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Config Tabs */}
        <Tabs defaultValue="homepage" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="homepage" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Trang chủ
            </TabsTrigger>
            <TabsTrigger value="header" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Header
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          {Object.entries(groupedConfigs).map(([section, sectionConfigs]) => (
            <TabsContent key={section} value={section} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getSectionIcon(section)}
                    {getSectionTitle(section)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {getSectionDescription(section)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Render configs with logical grouping */}
                  {(() => {
                    const renderConfigGroup = (
                      title: string,
                      configs: SystemConfigDto[],
                      description?: string
                    ) => (
                      <div className="space-y-4">
                        {title && (
                          <div className="border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {title}
                            </h3>
                            {description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {description}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="grid gap-4">
                          {configs.map((config) => (
                            <div
                              key={config.id}
                              className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-lg bg-gray-50"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Label className="font-medium text-gray-900">
                                    {config.key}
                                  </Label>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">
                                        {getKeyDescription(config.key)}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {config.type === "image" ? (
                                  <div className="space-y-3">
                                    {config.value && (
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={config.value}
                                          alt={config.key}
                                          className="h-20 w-20 object-cover rounded border"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-gray-600 break-all">
                                            {config.value}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor={`file-${config.id}`}
                                        className="cursor-pointer"
                                      >
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          disabled={uploading}
                                          className="flex items-center gap-2"
                                        >
                                          <Upload className="h-4 w-4" />
                                          {uploading
                                            ? "Đang tải..."
                                            : "Tải lên ảnh"}
                                        </Button>
                                      </Label>
                                      <input
                                        id={`file-${config.id}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {isEditing &&
                                    editingConfig?.id === config.id ? (
                                      <div className="space-y-3">
                                        <Textarea
                                          value={editValue}
                                          onChange={(e) =>
                                            setEditValue(e.target.value)
                                          }
                                          rows={
                                            config.key.includes("say") ? 4 : 2
                                          }
                                          className="w-full"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={handleSave}
                                            className="flex items-center gap-2"
                                          >
                                            <Save className="h-4 w-4" />
                                            Lưu
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="flex items-center gap-2"
                                          >
                                            <X className="h-4 w-4" />
                                            Hủy
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                          {config.value}
                                        </p>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEdit(config)}
                                          className="flex items-center gap-2"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Chỉnh sửa
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    // Group configs by type for homepage
                    if (section === "homepage") {
                      const basicConfigs = sectionConfigs.filter(
                        (c) =>
                          c.key === "textline" || c.key === "background-image"
                      );
                      const serviceConfigs = sectionConfigs.filter((c) =>
                        c.key.startsWith("service-div")
                      );
                      const achievementConfigs = sectionConfigs.filter((c) =>
                        c.key.startsWith("achievements-div")
                      );
                      const customerConfigs = sectionConfigs.filter((c) =>
                        c.key.startsWith("customers-say-div")
                      );
                      const otherConfigs = sectionConfigs.filter(
                        (c) =>
                          !c.key.startsWith("service-div") &&
                          !c.key.startsWith("achievements-div") &&
                          !c.key.startsWith("customers-say-div") &&
                          c.key !== "textline" &&
                          c.key !== "background-image"
                      );

                      return (
                        <>
                          {basicConfigs.length > 0 &&
                            renderConfigGroup(
                              "Thông tin cơ bản",
                              basicConfigs,
                              "Tiêu đề và hình nền chính của trang chủ"
                            )}
                          {serviceConfigs.length > 0 &&
                            renderConfigGroup(
                              "Dịch vụ",
                              serviceConfigs,
                              "Nội dung các dịch vụ mà công ty cung cấp"
                            )}
                          {achievementConfigs.length > 0 &&
                            renderConfigGroup(
                              "Thành tích",
                              achievementConfigs,
                              "Các con số và thành tích nổi bật của công ty"
                            )}
                          {customerConfigs.length > 0 &&
                            renderConfigGroup(
                              "Đánh giá khách hàng",
                              customerConfigs,
                              "Phản hồi và đánh giá từ khách hàng"
                            )}
                          {otherConfigs.length > 0 &&
                            renderConfigGroup("Khác", otherConfigs)}
                        </>
                      );
                    }

                    // Group configs by type for footer
                    if (section === "footer") {
                      const contactConfigs = sectionConfigs.filter(
                        (c) => c.key === "footer-contact-information"
                      );
                      const infoConfigs = sectionConfigs.filter(
                        (c) => c.key === "footer-slogan"
                      );
                      const socialConfigs = sectionConfigs.filter((c) =>
                        c.key.startsWith("footer-link-")
                      );
                      const otherFooterConfigs = sectionConfigs.filter(
                        (c) =>
                          !c.key.startsWith("footer-link-") &&
                          c.key !== "footer-contact-information" &&
                          c.key !== "footer-slogan"
                      );

                      return (
                        <>
                          {contactConfigs.length > 0 &&
                            renderConfigGroup(
                              "Thông tin liên hệ",
                              contactConfigs,
                              "Địa chỉ, số điện thoại, email và giờ làm việc"
                            )}
                          {infoConfigs.length > 0 &&
                            renderConfigGroup(
                              "Thông tin công ty",
                              infoConfigs,
                              "Slogan và mô tả về công ty"
                            )}
                          {socialConfigs.length > 0 &&
                            renderConfigGroup(
                              "Mạng xã hội",
                              socialConfigs,
                              "Links đến các trang mạng xã hội"
                            )}
                          {otherFooterConfigs.length > 0 &&
                            renderConfigGroup("Khác", otherFooterConfigs)}
                        </>
                      );
                    }

                    // For other sections, render normally
                    return renderConfigGroup("", sectionConfigs);
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default SystemConfig;
