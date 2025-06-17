import cron from "node-cron";
import { DateTime } from "luxon";
import { db } from "../config/config.js";

export default function driverInsuranceCron(io) {
  cron.schedule("0 */2 * * * *", async () => {
    try {
      const nowInDC = DateTime.now().setZone("America/New_York");
      const warningDate = nowInDC.plus({ days: 7 }); // 7 დღიანი გაფრთხილების პერიოდი

      const [drivers] = await db.query(
        "SELECT id, insurance_date, ins_exp, registration_date, reg_exp FROM drivers"
      );

      for (const driver of drivers) {
        // === Insurance Expiration ===
        let updated = false;

        if (driver.insurance_date) {
          const insuranceDate = DateTime.fromJSDate(driver.insurance_date, {
            zone: "America/New_York",
          });

          const shouldExpireInsurance = insuranceDate <= warningDate || insuranceDate < nowInDC ? 1 : 0;

          if (driver.ins_exp !== shouldExpireInsurance) {
            await db.query("UPDATE drivers SET ins_exp = ? WHERE id = ?", [
              shouldExpireInsurance,
              driver.id,
            ]);
            io.emit("insuranceUpdate", {
              driverId: driver.id,
              ins_exp: shouldExpireInsurance,
            });
            updated = true;
          }
        }

        // === Registration Expiration ===
        if (driver.registration_date) {
          const registrationDate = DateTime.fromJSDate(driver.registration_date, {
            zone: "America/New_York",
          });

          const shouldExpireRegistration = registrationDate <= warningDate || registrationDate < nowInDC ? 1 : 0;

          if (driver.reg_exp !== shouldExpireRegistration) {
            await db.query("UPDATE drivers SET reg_exp = ? WHERE id = ?", [
              shouldExpireRegistration,
              driver.id,
            ]);
            io.emit("registrationUpdate", {
              driverId: driver.id,
              reg_exp: shouldExpireRegistration,
            });
            updated = true;
          }
        }

        if (updated) {
          console.log(`Driver ${driver.id} updated.`);
        }
      }

      console.log("[CRON] Driver expiration checks completed.");
    } catch (err) {
      console.error("[CRON] Error checking expirations:", err.message);
    }
  });
}
