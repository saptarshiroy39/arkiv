"use client";

import { useEffect } from "react";

export default function Figlet() {
  useEffect(() => {
    const figletText = ` ______  ____    __  __   ______   __  __    
/\\  _  \\/\\  _\`\\ /\\ \\/\\ \\ /\\__  _\\ /\\ \\/\\ \\   
\\ \\ \\L\\ \\ \\ \\L\\ \\ \\ \\/'/'\\/_/\\ \\/ \\ \\ \\ \\ \\  
 \\ \\  __ \\ \\ ,  /\\ \\ , <    \\ \\ \\  \\ \\ \\ \\ \\ 
  \\ \\ \\/\\ \\ \\ \\\\ \\\\ \\ \\\\\`\\   \\_\\ \\__\\ \\ \\_/ \\
   \\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ /\\_____\\\\ \`\\___/
    \\/_/\\/_/\\/_/\\/ /\\/_/\\/_/ \\/_____/ \`\\/__/ `;

    console.log(
      `%c${figletText}\n`,
      "color: oklch(0.508 0.118 165.612); font-family: 'Courier New', Courier, monospace; font-weight: bold; white-space: pre; line-height: 1.2;"
    );
  }, []);

  return null;
}
