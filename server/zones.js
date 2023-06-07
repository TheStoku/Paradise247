const III_ZONES = [
    { name: "Callahan Bridge", gxt: "ROADBR1", pos1: new Vec2(617.442, -958.347), pos2: new Vec2(1065.44, -908.347) },
    { name: "Callahan Point", gxt: "PORT_W", pos1: new Vec2(751.68, -1178.22), pos2: new Vec2(1065.68, -958.725) },
    { name: "Atlantic Quays", gxt: "PORT_S", pos1: new Vec2(1065.88, -1251.55), pos2: new Vec2(1501.88, -1069.93) },
    { name: "Portland Harbor", gxt: "PORT_E", pos1: new Vec2(1363.68, -1069.65), pos2: new Vec2(1815.68, -613.646) },
    { name: "Trenton", gxt: "PORT_I", pos1: new Vec2(1065.88, -1069.85), pos2: new Vec2(1363.38, -742.054) },
    { name: "Chinatown", gxt: "CHINA", pos1: new Vec2(745.421, -908.289), pos2: new Vec2(1065.42, -463.69) },
    { name: "Red Light District", gxt: "REDLIGH", pos1: new Vec2(745.378, -463.616), pos2: new Vec2(1065.38, -282.616) },
    { name: "Hepburn Heights", gxt: "TOWERS", pos1: new Vec2(745.421, -282.4), pos2: new Vec2(1065.42, -78.7699) },
    { name: "Saint Mark's", gxt: "LITTLEI", pos1: new Vec2(1065.9, -512.324), pos2: new Vec2(1388.9, -78.324) },
    { name: "Harwood", gxt: "HARWOOD", pos1: new Vec2(745.979, -78.1778), pos2: new Vec2(1388.98, 322.676) },
    { name: "Portland Beach", gxt: "EASTBAY", pos1: new Vec2(1389.37, -613.467), pos2: new Vec2(1797.6, 199.628) },
    { name: "Portland View", gxt: "S_VIEW", pos1: new Vec2(1066.1, -741.806), pos2: new Vec2(1363.6, -512.806) },
    { name: "Callahan Bridge", gxt: "ROADBR2", pos1: new Vec2(444.768, -958.298), pos2: new Vec2(614.878, -908.298) },
    { name: "FILLIN1", gxt: "FILLIN1", pos1: new Vec2(1363.77, -613.339), pos2: new Vec2(1389.17, -512.539) },
    { name: "Fort Staunton", gxt: "CONSTRU", pos1: new Vec2(239.878, -411.617), pos2: new Vec2(614.322, -61.6167) },
    { name: "Aspartia", gxt: "STADIUM", pos1: new Vec2(-225.764, -412.604), pos2: new Vec2(116.236, 160.496) },
    { name: "Torrington", gxt: "YAKUSA", pos1: new Vec2(199.766, -1672.42), pos2: new Vec2(577.766, -1059.93) },
    { name: "Bedford Point", gxt: "SHOPING", pos1: new Vec2(-224.438, -1672.05), pos2: new Vec2(199.562, -1004.45) },
    { name: "Newport", gxt: "COM_EAS", pos1: new Vec2(200.107, -1059.19), pos2: new Vec2(615.107, -412.193) },
    { name: "Belleville Park", gxt: "PARK", pos1: new Vec2(-121.567, -1003.07), pos2: new Vec2(199.271, -413.068) },
    { name: "Liberty Campus", gxt: "UNIVERS", pos1: new Vec2(117.268, -411.622), pos2: new Vec2(239.268, -61.6218) },
    { name: "Rockford", gxt: "HOSPI_2", pos1: new Vec2(117.236, -61.1105), pos2: new Vec2(615.236, 268.889) },
    { name: "Francis Intl. Airport", gxt: "AIRPORT", pos1: new Vec2(-1632.97, -1344.71), pos2: new Vec2(-468.629, -268.443) },
    { name: "Wichita Gardens", gxt: "PROJECT", pos1: new Vec2(-811.835, -268.074), pos2: new Vec2(-371.041, 92.7263) },
    { name: "Cedar Grove", gxt: "SWANKS", pos1: new Vec2(-867.229, 93.3882), pos2: new Vec2(-266.914, 650.058) },
    { name: "Pike Creek", gxt: "SUB_IND", pos1: new Vec2(-1407.57, -267.966), pos2: new Vec2(-812.306, 92.7559) },
    { name: "Cochrane Dam", gxt: "BIG_DAM", pos1: new Vec2(-1394.5, 93.4441), pos2: new Vec2(-867.52, 704.544) },
    { name: "Shoreside Vale", gxt: "SUB_ZON", pos1: new Vec2(-1644.64, -1351.38), pos2: new Vec2(-266.895, 1206.35) },
    { name: "Staunton Island", gxt: "COM_ZON", pos1: new Vec2(-265.479, -1719.97), pos2: new Vec2(615.52, 367.265) },
    { name: "Shoreside Vale", gxt: "SUB_ZO2", pos1: new Vec2(-265.444, 161.113), pos2: new Vec2(-121.287, 367.043) },
    { name: "Shoreside Vale", gxt: "SUB_ZO3", pos1: new Vec2(-265.434, 79.0922), pos2: new Vec2(-226.334, 161.064) },
    { name: "Portland", gxt: "IND_ZON", pos1: new Vec2(617.151, -1329.72), pos2: new Vec2(1902.66, 434.115) }
    //{ name: "FISHFAC", gxt: "FISHFAC", pos1: new Vec2(944.208, -1149.81), pos2: new Vec2(1016.14, -1076.01) },
    //{ name: "COPS_1", gxt: "COPS_1", pos1: new Vec2(1135.8, -695.021), pos2: new Vec2(1182.36, -631.021) },
    //{ name: "HOSPI_1", gxt: "HOSPI_1", pos1: new Vec2(1136.09, -609.976), pos2: new Vec2(1182.09, -521.167) },
    /*{ name: "MAIN_D1", gxt: "MAIN_D1", pos1: new Vec2(1037.53, -907.274), pos2: new Vec2(1065.16, -637.689) },
    { name: "MAIN_D2", gxt: "MAIN_D2", pos1: new Vec2(966.079, -637.366), pos2: new Vec2(1064.83, -609.557) },
    { name: "MAIN_D3", gxt: "MAIN_D3", pos1: new Vec2(965.795, -608.99), pos2: new Vec2(995.306, -470.23) },
    { name: "MAIN_D4", gxt: "MAIN_D4", pos1: new Vec2(995.59, -511.092), pos2: new Vec2(1065.11, -470.23) },
    { name: "MAIN_D5", gxt: "MAIN_D5", pos1: new Vec2(1035.88, -463.56), pos2: new Vec2(1064.83, -282.86) },
    { name: "MAIN_D6", gxt: "MAIN_D6", pos1: new Vec2(1036.15, -281.96), pos2: new Vec2(1064.85, -179.224) },*/
    //{ name: "WEE_DAM", gxt: "WEE_DAM", pos1: new Vec2(-1238.59, 306.841), pos2: new Vec2(-910.445, 504.646) }
]

function getZoneFromPosition(position) {
    position = new Vec2(position.x, position.y);

    for (let index = 0; index < III_ZONES.length; index++) {
        const element = III_ZONES[index];
        if (inPoly(position, element.pos1, element.pos2, new Vec2(element.pos1.x, element.pos2.y), new Vec2(element.pos2.x, element.pos1.y))) {
            return element.name;
        } else {
            return "Unknown";
        }
    }
}

function getZoneFromElement(element) {
    let position = new Vec2(element.position.x, element.position.y);

    for (let index = 0; index < III_ZONES.length; index++) {
        const element = III_ZONES[index];
        if (inPoly(position, element.pos1, element.pos2, new Vec2(element.pos1.x, element.pos2.y), new Vec2(element.pos2.x, element.pos1.y))) {
            return element.name;
        } else {
            return "Unknown";
        }
    }
}