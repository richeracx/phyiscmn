import os
import subprocess
import numpy as np
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'audio')
os.makedirs(OUT_DIR, exist_ok=True)
SR = 44100

def save_mp3(audio_data, filename, ffmpeg_filters=""):
    """Save 1D or 2D numpy float array (-1 to 1) to an MP3 using ffmpeg."""
    temp_raw = os.path.join(OUT_DIR, '_temp.raw')
    out_path = os.path.join(OUT_DIR, filename)

    if audio_data.ndim == 1:
        audio_data = np.stack([audio_data, audio_data], axis=-1)
    
    # Clip and convert to 16-bit PCM
    audio_int16 = (np.clip(audio_data, -1.0, 1.0) * 32767).astype(np.int16)
    audio_int16.tofile(temp_raw)

    cmd = [
        FFMPEG, '-y',
        '-f', 's16le',
        '-ar', str(SR),
        '-ac', '2',
        '-i', temp_raw,
    ]
    if ffmpeg_filters:
        cmd.extend(['-af', ffmpeg_filters])
    cmd.extend(['-b:a', '192k', out_path])

    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    if os.path.exists(temp_raw):
        os.remove(temp_raw)
    print(f"Generated {filename} ({os.path.getsize(out_path)} bytes)")

# ==============================================================================
# 1. Starlight Shimmer (shimmer.mp3)
# ==============================================================================
def gen_shimmer():
    dur = 3.2
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    left = np.zeros_like(t)
    right = np.zeros_like(t)

    # Celestial harmonics: F#maj9 chord (F#6, G#6, A#6, C#7, F7, F#7)
    notes = [1479.98, 1661.22, 1864.66, 2217.46, 2793.83, 2959.96, 3729.31, 4434.92]
    
    # Staggered bell sparkles
    np.random.seed(42)
    for i, freq in enumerate(notes):
        delay = i * 0.08 + np.random.uniform(0, 0.04)
        idx_start = int(delay * SR)
        span = t[idx_start:] - delay
        
        # Bell envelope: sharp attack, long exponential decay
        env = np.exp(-span * (1.8 + i * 0.25))
        
        # Tremolo starlight vibrato (8 Hz)
        trem = 1.0 + 0.25 * np.sin(2 * np.pi * 8.2 * span)
        
        # Fundamental + octave shimmer
        tone = (np.sin(2 * np.pi * freq * span) + 
                0.4 * np.sin(2 * np.pi * freq * 2.005 * span) +
                0.15 * np.sin(2 * np.pi * freq * 3.01 * span)) * env * trem
        
        pan = (i / (len(notes) - 1)) * 1.6 - 0.8 # -0.8 to +0.8
        l_gain = np.cos((pan + 1) * np.pi / 4)
        r_gain = np.sin((pan + 1) * np.pi / 4)

        left[idx_start:] += tone * l_gain * 0.22
        right[idx_start:] += tone * r_gain * 0.22

    # High crystalline stardust noise wash
    noise = np.random.normal(0, 0.03, len(t))
    noise_env = np.sin(np.pi * np.clip(t / 2.5, 0, 1)) ** 2
    left += noise * noise_env * 0.08
    right += np.roll(noise, 24) * noise_env * 0.08

    stereo = np.stack([left, right], axis=-1)
    # Apply lush reverb with ffmpeg aecho
    save_mp3(stereo, 'shimmer.mp3', "aecho=0.85:0.8:60|140|280:0.4|0.25|0.15,highpass=f=400,treble=g=4:f=6000")

# ==============================================================================
# 2. Singularity Implosion / Charge-up (charge.mp3)
# ==============================================================================
def gen_charge():
    dur = 2.4
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    
    # Gravitational vacuum rising pitch: 60Hz -> 540Hz
    phase = 2 * np.pi * (60 * t + (540 - 60) / 2 * (t / dur) ** 2.2 * t)
    suck = np.sin(phase)
    
    # Swelling volume curve culminating in dead silence at 2.2s
    env = np.where(t < 2.15, (t / 2.15) ** 2.0, 0)
    
    # Inrushing air / space noise
    noise = np.random.normal(0, 0.35, len(t)) * env * 0.6
    
    combined = (suck * env * 0.5 + noise * 0.4)
    # Sudden cutoff before detonation
    combined = np.where(t > 2.18, 0, combined)
    
    save_mp3(combined, 'charge.mp3', "lowpass=f=1200,aecho=0.8:0.7:50:0.3")

# ==============================================================================
# 3. Gravitational Wave Click Ripple (grav-wave.mp3)
# ==============================================================================
def gen_grav_wave():
    dur = 1.2
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    
    # Sub-bass punch dropping 110Hz -> 35Hz
    sub_pitch = 35 + 75 * np.exp(-t * 9.0)
    sub = np.sin(2 * np.pi * sub_pitch * t) * np.exp(-t * 4.2) * 0.7
    
    # Space water-drop crystal ping: 1200Hz
    ping = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 18.0) * 0.25
    
    combined = sub + ping
    save_mp3(combined, 'grav-wave.mp3', "aecho=0.8:0.6:80|180:0.3|0.15")

# ==============================================================================
# 4. Warp Starfield Cruising (warp.mp3)
# ==============================================================================
def gen_warp():
    dur = 3.0
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    
    # Atmospheric deep cosmic wind
    noise = np.random.normal(0, 0.4, len(t))
    env = np.sin(np.pi * (t / dur)) ** 1.8
    sub_hum = np.sin(2 * np.pi * 65 * t) * 0.3
    
    combined = (noise * 0.35 + sub_hum) * env
    save_mp3(combined, 'warp.mp3', "lowpass=f=600,bass=g=6:f=80,aecho=0.8:0.8:120:0.4")

# ==============================================================================
# 5. UI Glass Hover & Click (button-hover.mp3, button-click.mp3)
# ==============================================================================
def gen_ui_sounds():
    # Hover: ultra-soft high glass pip (60ms)
    dur = 0.08
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    pip = np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 85) * 0.3
    save_mp3(pip, 'button-hover.mp3')

    # Click: resonant tactile glass tap (140ms)
    dur = 0.16
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    tap1 = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 55) * 0.45
    tap2 = np.sin(2 * np.pi * 925 * t) * np.exp(-t * 35) * 0.35
    save_mp3(tap1 + tap2, 'button-click.mp3')

# ==============================================================================
# 6. Act II Academic Glyph Lock (glyph.mp3)
# ==============================================================================
def gen_glyph():
    dur = 0.06
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    click = np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 110) * 0.25
    save_mp3(click, 'glyph.mp3')

# ==============================================================================
# 7. Fallback Explosion & BGM (if user hasn't copied custom ones yet)
# ==============================================================================
def gen_fallbacks():
    exp_path = os.path.join(OUT_DIR, 'explosion.mp3')
    if not os.path.exists(exp_path):
        dur = 4.5
        t = np.linspace(0, dur, int(SR * dur), endpoint=False)
        sub = np.sin(2 * np.pi * (32 + 120 * np.exp(-t * 4.0)) * t) * np.exp(-t * 1.1) * 0.8
        noise = np.random.normal(0, 0.6, len(t)) * np.exp(-t * 1.6) * 0.5
        save_mp3(sub + noise, 'explosion.mp3', "bass=g=12:f=60,aecho=0.8:0.7:100|240:0.4|0.2")

    bgm_path = os.path.join(OUT_DIR, 'background-music.mp3')
    if not os.path.exists(bgm_path):
        # 24s loopable ambient space pad (A minor fifths: A1, E2, A2, C3, E3)
        dur = 24.0
        t = np.linspace(0, dur, int(SR * dur), endpoint=False)
        chord = np.zeros_like(t)
        for f, g in [(55.0, 0.3), (82.4, 0.25), (110.0, 0.2), (130.8, 0.15), (164.8, 0.12), (220.0, 0.1)]:
            # Slow modulation
            mod = 1.0 + 0.15 * np.sin(2 * np.pi * 0.1 * t + f)
            chord += np.sin(2 * np.pi * f * t) * g * mod
        # Smooth loop envelope
        fade = np.sin(np.pi * (t / dur)) ** 0.5
        save_mp3(chord * fade, 'background-music.mp3', "lowpass=f=900,aecho=0.85:0.8:250|500:0.35|0.2")

if __name__ == '__main__':
    print("Generating sound effects gallery...")
    gen_shimmer()
    gen_charge()
    gen_grav_wave()
    gen_warp()
    gen_ui_sounds()
    gen_glyph()
    gen_fallbacks()
    print("Done!")
