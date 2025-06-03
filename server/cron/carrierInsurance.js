
import cron from "node-cron";
import { DateTime } from "luxon";
import {db} from "../config/db.js"; 

export default function carrierInsuranceCron(io) {
  cron.schedule("0 */2 * * * *", async () => {
    //console.log("🔄 [CRON] Checking insurance expiration window (≤ 7 days or expired)");

    try {
      const nowInDC = DateTime.now().setZone("America/New_York");
      const warningDate = nowInDC.plus({ days: 7 }); // 7 დღის მაქსიმუმი

      const [carriers] = await db.query(
        "SELECT id, insurance_date, ins_exp FROM carriers"
      );

      for (const carrier of carriers) {

         
        if (!carrier.insurance_date) continue;

        

      const insuranceDate = DateTime.fromJSDate(carrier.insurance_date, {
  zone: "America/New_York",
});

   

        // **თუ `insurance_date` ≤ 7 დღეა ან უკვე ვადაგასულია, ins_exp = 1**
        const shouldBeExpiringSoon = insuranceDate <= warningDate || insuranceDate < nowInDC ? 1 : 0;
    

        if (carrier.ins_exp !== shouldBeExpiringSoon) {
          await db.query("UPDATE carriers SET ins_exp = ? WHERE id = ?", [
            shouldBeExpiringSoon,
            carrier.id,
          ]);
           
          io.emit("insuranceUpdate", { carrierId: carrier.id, ins_exp: shouldBeExpiringSoon });
        }
      }

      //console.log("[CRON] Insurance expiration check completed.");
    } catch (err) {
      console.error("[CRON] Error checking insurance expiration:", err.message);
    }
  });
}