import fs from "fs";
import path from "path";

export const deleteFile = (relativeFilePath) => {
  try {
    const absolutePath = path.join(process.cwd(), relativeFilePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    } else {

    }
  } catch (error) {

  }
};
