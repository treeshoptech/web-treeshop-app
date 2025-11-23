import { mutation } from "./_generated/server";
import { v } from "convex/values";

// One-time migration to add companyId to equipment that's missing it
export const fixEquipmentCompanyId = mutation({
  args: {
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all equipment without companyId
    const allEquipment = await ctx.db.query("equipment").collect();
    const equipmentWithoutCompanyId = allEquipment.filter(e => !e.companyId);

    console.log(`Found ${equipmentWithoutCompanyId.length} equipment items without companyId`);

    for (const equipment of equipmentWithoutCompanyId) {
      await ctx.db.patch(equipment._id, {
        companyId: args.companyId,
      });
      console.log(`Fixed equipment ${equipment.name} - added companyId: ${args.companyId}`);
    }

    return {
      success: true,
      fixed: equipmentWithoutCompanyId.length,
    };
  },
});
