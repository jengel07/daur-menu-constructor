const fs = require('fs');

let code = fs.readFileSync('daur-menu-backend/index.js', 'utf8');

// Replace standard api/staff endpoint
const standardStaffRegex = /const hashedPassword = await bcrypt\.hash\(password, SALT_ROUNDS\);\s*const newStaff = await db\.staff\.create\(\{\s*data:\s*\{\s*name,\s*email,\s*password:\s*hashedPassword,\s*role:\s*normalizedRole,\s*restaurantId:\s*req\.user\.restaurantId,?\s*\},?\s*\}\);/g;

const standardStaffReplacement = `const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      let newStaff = await db.staff.findUnique({ where: { email } });
      if (newStaff) {
        if (newStaff.restaurantId !== req.user.restaurantId) {
          return res.status(403).json({ success: false, message: 'Этот email уже используется в другом заведении.' });
        }
        newStaff = await db.staff.update({
          where: { email },
          data: { name, password: hashedPassword, role: normalizedRole }
        });
      } else {
        newStaff = await db.staff.create({
          data: { name, email, password: hashedPassword, role: normalizedRole, restaurantId: req.user.restaurantId }
        });
      }`;

code = code.replace(standardStaffRegex, standardStaffReplacement);


// Replace superadmin api/staff endpoint
const superadminStaffRegex = /const hashedPassword = await bcrypt\.hash\(password, SALT_ROUNDS\);\s*const newStaff = await db\.staff\.create\(\{\s*data:\s*\{\s*name,\s*email,\s*password:\s*hashedPassword,\s*role:\s*normalizedRole,\s*restaurantId,?\s*\},?\s*\}\);/g;

const superadminStaffReplacement = `const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      let newStaff = await db.staff.findUnique({ where: { email } });
      if (newStaff) {
        if (newStaff.restaurantId !== restaurantId) {
          return res.status(403).json({ success: false, message: 'Этот email уже используется в другом заведении.' });
        }
        newStaff = await db.staff.update({
          where: { email },
          data: { name, password: hashedPassword, role: normalizedRole }
        });
      } else {
        newStaff = await db.staff.create({
          data: { name, email, password: hashedPassword, role: normalizedRole, restaurantId }
        });
      }`;

code = code.replace(superadminStaffRegex, superadminStaffReplacement);


// Also remove the P2002 error handling so it doesn't do anything weird, although it won't hit it anymore for same restaurant.
// But it's fine to leave it in case of race conditions.

fs.writeFileSync('daur-menu-backend/index.js', code);
console.log('Done!');

