const fs = require('fs');
const path = require('path');

const userFiles = [
  'frontend/user/src/pages/Book.tsx',
  'frontend/user/src/pages/NearestStations.tsx',
  'frontend/user/src/pages/RentPin.tsx',
  'frontend/user/src/pages/Dashboard.tsx'
];

userFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (!content.includes('import { getApiUrl }')) {
    content = "import { getApiUrl } from '../utils/api';\n" + content;
    modified = true;
  }

  const oldProv = "const PROVINCE_API = 'http://localhost:8080/api/donvihanhchinh/tinhThanh';";
  const newProv = "const PROVINCE_API = getApiUrl('/api/donvihanhchinh/tinhThanh');";
  if (content.includes(oldProv)) {
    content = content.replace(oldProv, newProv);
    modified = true;
  }

  const oldDist = "const DISTRICT_API = 'http://localhost:8080/api/donvihanhchinh/quanHuyen';";
  const newDist = "const DISTRICT_API = getApiUrl('/api/donvihanhchinh/quanHuyen');";
  if (content.includes(oldDist)) {
    content = content.replace(oldDist, newDist);
    modified = true;
  }

  const oldWard = "const WARD_API = 'http://localhost:8080/api/donvihanhchinh/phuongXa';";
  const newWard = "const WARD_API = getApiUrl('/api/donvihanhchinh/phuongXa');";
  if (content.includes(oldWard)) {
    content = content.replace(oldWard, newWard);
    modified = true;
  }

  const oldUrl = "`http://localhost:8080/api/station/page";
  const newUrl = "getApiUrl(`/api/station/page";
  
  // Custom replaces for NearestStations and Dashboard
  if (content.includes(oldUrl)) {
    content = content.replace(/`http:\/\/localhost:8080(\/api\/station\/page[^`]+)`/g, "getApiUrl(`$1`)");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', file);
  }
});
