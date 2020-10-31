const axios = require('axios');
/*
  TODO: make info a struct
  {
    course: "I&C SCI 33",
    name: "INTERMEDIATE PRGMG",
    codes: [],
    types: [],
    instructors: [],
    times: [],
    places: [],
    finals: [],
    max: 356,
    enr: 325,
    rstr: "A",
    status: []
  }
*/


// 03: Winter
// 14: Spring
// 92: Fall
var defaultData = {
  Submit: "Display Text Results",
  YearTerm: "2020-92",
  ShowComments: "off",
  ShowFinals: "on",
  Breadth: "ANY",
  Dept: "I&C SCI",
  CourseNum: "31",
  Division: "ANY",
  CourseCodes: "",
  InstrName: "",
  CourseTitle: "",
  ClassType: "ALL",
  Units: "",
  Days: "",
  StartTime: "",
  EndTime: "",
  MaxCap: "",
  FullCourses: "ANY",
  FontSize: "100",
  CancelledCourses: "Excluded",
  Bldg: "",
  Room: ""
};

const websocRequest = async function(options = null) {
  var data = defaultData;
  if (options != null) {
    data.Dept = options.Dept.replace('&', "%26");
    data.CourseNum = options.CourseNum;
  }
  var dataString = ""
  Object.keys(data).forEach(key => {
    dataString = dataString + `${key}=${data[key]}&`;
  });
  var res = await axios.post("https://www.reg.uci.edu/perl/WebSoc", dataString);
  return res.data;
  
}


module.exports = {websocRequest};
