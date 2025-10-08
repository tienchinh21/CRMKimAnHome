import { useState, useEffect } from "react";
import LocationService from "@/services/api/LocationService";

interface LocationOption {
  value: string;
  label: string;
}

export const useLocationManagement = () => {
  // Location selection states
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const provincesData = await LocationService.getProvinces();

        if (provincesData && provincesData.length > 0) {
          const provinceOptions = provincesData.map((province) => ({
            value: province.code.toString(),
            label: province.name,
          }));
          setProvinces(provinceOptions);
        } else {
          console.warn("No provinces data received");
        }
      } catch (error) {
        console.error("Error loading provinces:", error);
        alert("Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại.");
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        try {
          setLoadingDistricts(true);
          const districtsData = await LocationService.getDistrictsByProvince(
            parseInt(selectedProvince)
          );

          if (districtsData && districtsData.length > 0) {
            const districtOptions = districtsData.map((district) => ({
              value: district.code.toString(),
              label: district.name,
            }));
            setDistricts(districtOptions);
          } else {
            console.warn("No districts data received");
            setDistricts([]);
          }

          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        } catch (error) {
          console.error("Error loading districts:", error);
          alert("Không thể tải danh sách quận/huyện. Vui lòng thử lại.");
        } finally {
          setLoadingDistricts(false);
        }
      };

      loadDistricts();
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const loadWards = async () => {
        try {
          setLoadingWards(true);
          const wardsData = await LocationService.getWardsByDistrict(
            parseInt(selectedDistrict)
          );

          if (wardsData && wardsData.length > 0) {
            const wardOptions = wardsData.map((ward) => ({
              value: ward.code.toString(),
              label: ward.name,
            }));
            setWards(wardOptions);
          } else {
            console.warn("No wards data received");
            setWards([]);
          }

          setSelectedWard("");
        } catch (error) {
          console.error("Error loading wards:", error);
          alert("Không thể tải danh sách phường/xã. Vui lòng thử lại.");
        } finally {
          setLoadingWards(false);
        }
      };

      loadWards();
    }
  }, [selectedDistrict]);

  // Update full address when location changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const provinceName =
        provinces.find((p) => p.value === selectedProvince)?.label || "";
      const districtName =
        districts.find((d) => d.value === selectedDistrict)?.label || "";
      const wardName = wards.find((w) => w.value === selectedWard)?.label || "";

      // Tạo fullAddress = địa chỉ + xã + huyện + tỉnh
      const locationParts = [wardName, districtName, provinceName].filter(
        Boolean
      );
      const fullLocation = locationParts.join(", ");

      if (address.trim()) {
        setFullAddress(`${address.trim()}, ${fullLocation}`);
      } else {
        setFullAddress(fullLocation);
      }
    }
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    provinces,
    districts,
    wards,
    address,
  ]);

  return {
    // Location data
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    address,
    fullAddress,

    // Loading states
    loadingProvinces,
    loadingDistricts,
    loadingWards,

    // Setters
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    setAddress,
  };
};
