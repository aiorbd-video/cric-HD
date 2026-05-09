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
        return new Response("Source playlist not found", {
          status: 502
        });
      }

      const text = await response.text();

      // FIX BROKEN PLAYLIST FORMAT
      const normalized = text
        .replace(/#EXTM3U/g, "\n#EXTM3U")
        .replace(/#EXTINF/g, "\n#EXTINF")
        .replace(/#EXTVLCOPT/g, "\n#EXTVLCOPT")
        .replace(/https?:\/\//g, "\n$&")
        .replace(/# ---/g, "\n# ---");

      const lines = normalized
        .split(/\r?\n/)
        .map(line => line.trim())
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

      // কোন group-title রাখতে চাও
      const allowedGroups = [
        "Live Cricket",
        "Live Football",
        "Live Sports"
      ];

      for (let i = 0; i < lines.length; i++) {

        const line = lines[i];

        // FILTER LIVE EVENTS
        if (
          line.startsWith("#EXTINF") &&
          allowedGroups.some(group =>
            line.includes(`group-title="${group}"`)
          )
        ) {

          output.push(line);

          let j = i + 1;

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

    } catch (err) {

      return new Response(
        "Error: " + err.message,
        { status: 500 }
      );

    }
  }
};
