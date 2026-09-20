# Video Generation Pipeline (`tools/video/`)

This directory contains the automated offline video generator script `generate_concept_videos.py`.

## Architecture & Credibility Pipeline

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ LLM Script      │ ──> │ Manim 3D Engine  │ ──> │ Dual TTS Synth   │
│ Prompt Template │     │ Community Edition│     │ (English & Hindi)│
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ content/        │ <── │ JSON Cues &      │ <── │ ffmpeg Muxing &  │
│ concept-videos  │     │ Transcripts      │     │ Audio Alignment  │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

1. **LLM Prompting**: Generates timed mathematical scene scripts with explicit step timings.
2. **Manim Rendering**: Executes Manim CLI to generate 1080p60 H.264 video.
3. **Dual-Language TTS**: Generates synchronized English and Hindi audio tracks.
4. **ffmpeg Alignment**: Muxes audio with timestamp cues and writes `content/concept-videos.json`.
