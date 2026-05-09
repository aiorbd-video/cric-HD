export default {
  async fetch(request) {

    const url = new URL(request.url);

    if (url.pathname !== "/playlist.m3u") {
      return new Response("Not Found", { status: 404 });
    }

    const SOURCE =
      "https://raw.githubusercontent.com/srhady/crichd-speical-live-event/main/playlist.m3u";

    try {

      const response = await fetch(SOURCE);

      if (!response.ok) {
        return new Response("Failed to fetch source", {
          status: 502
        });
      }

      let text = await response.text();

      // FIX PLAYLIST FORMAT
      text = text
        .replace(/#EXTM3U/g, "\n#EXTM3U")
        .replace(/#EXTINF:/g, "\n#EXTINF:")
        .replace(/#EXTVLCOPT:/g, "\n#EXTVLCOPT:")
        .replace(/(https?:\/\/[^\s#]+)/g, "\n$1")
        .replace(/# ---/g, "\n# ---");

      const lines = text
        .split(/\r?\n/)
        .map(v => v.trim())
        .filter(Boolean);

      const output = [];

      const now = new Date().toLocaleString("en-BD", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
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
            line.includes('group-title="Live Cricket"') ||
            line.includes('group-title="Live Football"') ||
            line.includes('group-title="Live Sports"')
          )
        ) {

          output.push(line);

          let j = i + 1;

          // ADD RELATED LINES
          while (
            j < lines.length &&
            !lines[j].startsWith("#EXTINF")
          ) {

            output.push(lines[j]);
            j++;
          }

          output.push("");

          i = j - 1;
        }
      }

      return new Response(output.join("\n"), {
        headers: {
          "content-type": "application/x-mpegURL; charset=utf-8",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (e) {

      return new Response(
        "Error: " + e.message,
        { status: 500 }
      );

    }
  }
};
