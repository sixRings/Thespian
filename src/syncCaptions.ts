import * as fs from "fs";
import ffmpeg = require("fluent-ffmpeg");

interface Caption {
    start: number; // start time in seconds
    end: number; // end time in seconds
    text: string; // caption text
}

const videoPath = "./video_1/video.mp4";
const captionsPath = "./video_1/captions.srt";

const parseSrt = (srtFilePath: string): Caption[] => {
    const srtData = fs.readFileSync(srtFilePath, "utf8");

    const captionBlocks = srtData.split("\n\n");

    return captionBlocks.map((block) => {
        const lines = block.split("\n");
        const times = lines[1].split(" --> ");
        const start = parseTime(times[0]);
        const end = parseTime(times[1]);
        const text = lines.slice(2).join(" ");
        return { start, end, text };
    });
};

const parseTime = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(parseFloat);
    return hours * 3600 + minutes * 60 + seconds;
};

const syncCaptions = (videoPath: string, captions: Caption[]): void => {
    const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
    const ffmpeg = require("fluent-ffmpeg");
    ffmpeg.setFfmpegPath(ffmpegPath);
    const ffmpegCommand = ffmpeg(videoPath);

    captions.forEach((caption) => {
        ffmpegCommand
            .outputOptions([`-vf subtitles=${captionsPath}`])
            .output(`outputs/output_${caption.start}.mp4`)
            .seekInput(caption.start);
    });

    ffmpegCommand.on("end", () => {
        console.log("Processing finished!");
    });

    ffmpegCommand.run();
};

const captions = parseSrt(captionsPath);

syncCaptions(videoPath, captions);
