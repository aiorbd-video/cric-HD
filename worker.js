export default {
  async fetch(request) {

    const SOURCE = "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/playlist.m3u";

    const response = await fetch(SOURCE);

    const text = await response.text();

    const lines = text.split("\n");

    const output = [];

    const now = new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    output.push("#EXTM3U");
    output.push(`#LAST-UPDATED: ${now}`);
    output.push("");

    for (let i = 0; i < lines.length; i++) {

      const line = lines[i];

      if (
        line.startsWith("#EXTINF") &&
        (
          line.includes("Live") ||
          line.includes("live") ||
          line.includes("vs") ||
          line.includes("VS")
        )
      ) {

        output.push(line);

        let j = i + 1;

        while (j < lines.length && !lines[j].startsWith("#EXTINF")) {

          output.push(lines[j]);

          j++;
        }

        output.push("");

        i = j - 1;
      }
    }

    return new Response(output.join("\n"), {
      headers: {
        "content-type": "application/x-mpegURL",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  }
}
