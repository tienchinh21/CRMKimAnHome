import { useState, useCallback } from "react";
import ProjectService from "@/services/api/ProjectService";
import type {
  ParentAmenity,
  ChildAmenity,
} from "@/lib/validations/projectValidation";

export const useAmenityManagement = (projectId: string | null) => {
  // Amenity states
  const [parentAmenities, setParentAmenities] = useState<ParentAmenity[]>([]);
  const [childAmenities, setChildAmenities] = useState<ChildAmenity[]>([]);
  const [newParentAmenity, setNewParentAmenity] = useState("");
  const [newChildAmenity, setNewChildAmenity] = useState<ChildAmenity>({
    name: "",
    parentName: "",
  });

  // Loading states
  const [creatingParentAmenity, setCreatingParentAmenity] = useState(false);
  const [creatingChildAmenity, setCreatingChildAmenity] = useState(false);

  // Load amenities from API
  const loadAmenities = useCallback(async () => {
    if (!projectId || projectId.startsWith("temp_")) {
      return;
    }

    try {
      const amenitiesRes = await ProjectService.getAmenitiesByProjectId(
        projectId
      );
      const list = amenitiesRes.data?.content || amenitiesRes.data || [];

      // Separate parent and child amenities
      const parents: ParentAmenity[] = [];
      const children: ChildAmenity[] = [];

      list.forEach((amenity: any) => {
        if (amenity.parentId === null) {
          // Parent amenity
          parents.push({
            ...(amenity.id && { id: amenity.id }),
            name: amenity.name,
          });
        } else {
          // Child amenity - need to find parent name
          const parent = list.find((p: any) => p.id === amenity.parentId);
          children.push({
            ...(amenity.id && { id: amenity.id }),
            name: amenity.name,
            parentName: parent?.name || "",
            parentId: amenity.parentId,
          });
        }
      });

      setParentAmenities(parents);
      setChildAmenities(children);
    } catch (error) {
      console.error("❌ Error loading amenities:", error);
    }
  }, [projectId]);

  // Handle adding parent amenity with API call
  const handleAddParentAmenity = async () => {
    if (!newParentAmenity.trim() || !projectId || projectId.startsWith("temp_"))
      return;

    try {
      setCreatingParentAmenity(true);

      const amenityPayload = {
        name: newParentAmenity.trim(),
        projectId: projectId,
        parentId: null,
      };

      const response = await ProjectService.createAmenity(amenityPayload);
      const createdAmenity = response.data?.content || response.data;

      if (createdAmenity) {
        setNewParentAmenity("");
        // Refresh amenities list
        await loadAmenities();
      }
    } catch (error) {
      console.error("Error creating parent amenity:", error);
    } finally {
      setCreatingParentAmenity(false);
    }
  };

  // Handle adding child amenity with API call
  const handleAddChildAmenity = async () => {
    if (
      !newChildAmenity.name.trim() ||
      !newChildAmenity.parentName ||
      !projectId ||
      projectId.startsWith("temp_")
    )
      return;

    try {
      setCreatingChildAmenity(true);

      // Find parent amenity to get ID
      const parentAmenity = parentAmenities.find(
        (p) => p.name === newChildAmenity.parentName
      );
      if (!parentAmenity || !parentAmenity.id) {
        console.error("Parent amenity not found or no ID");
        return;
      }

      const amenityPayload = {
        name: newChildAmenity.name.trim(),
        projectId: projectId,
        parentId: parentAmenity.id,
      };

      const response = await ProjectService.createAmenity(amenityPayload);
      const createdAmenity = response.data?.content || response.data;

      if (createdAmenity) {
        setNewChildAmenity({ name: "", parentName: "" });
        // Refresh amenities list
        await loadAmenities();
      }
    } catch (error) {
      console.error("Error creating child amenity:", error);
    } finally {
      setCreatingChildAmenity(false);
    }
  };

  // Update parent amenity
  const updateParentAmenity = async (id: string, newName: string) => {
    try {
      await ProjectService.updateAmenity(id, { name: newName });
      await loadAmenities(); // Refresh data
    } catch (error) {
      console.error("Error updating parent amenity:", error);
    }
  };

  // Update child amenity
  const updateChildAmenity = async (
    id: string,
    newName: string,
    parentId: string
  ) => {
    try {
      await ProjectService.updateAmenity(id, {
        name: newName,
        parentId: parentId,
      });
      await loadAmenities(); // Refresh data
    } catch (error) {
      console.error("Error updating child amenity:", error);
    }
  };

  // Remove parent amenity (local only for now)
  const removeParentAmenity = (index: number) => {
    setParentAmenities(parentAmenities.filter((_, i) => i !== index));
  };

  // Remove child amenity (local only for now)
  const removeChildAmenity = (index: number) => {
    setChildAmenities(childAmenities.filter((_, i) => i !== index));
  };

  return {
    // States
    parentAmenities,
    childAmenities,
    newParentAmenity,
    newChildAmenity,
    creatingParentAmenity,
    creatingChildAmenity,

    // Setters
    setParentAmenities,
    setChildAmenities,
    setNewParentAmenity,
    setNewChildAmenity,

    // Methods
    loadAmenities,
    handleAddParentAmenity,
    handleAddChildAmenity,
    updateParentAmenity,
    updateChildAmenity,
    removeParentAmenity,
    removeChildAmenity,
  };
};
