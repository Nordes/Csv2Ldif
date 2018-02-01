import csvReader = require("csvtojson");

export const csvParser = async (file: string) => {
  csvReader({ }).fromFile("./ADUsers.csv")
    .on("end_parsed", (jsonObjArr: any[]) => {
      console.log(jsonObjArr);
    });
};
