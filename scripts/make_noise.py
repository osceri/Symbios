import numpy as np
import matplotlib.pyplot as plt

# Parameters
N = 128  # Image size
num_octaves = 8  # Number of octave bands

# Generate octave band frequencies
f_octaves = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
f_octaves = np.array(f_octaves)
f_octaves = f_octaves[f_octaves <= N/2]  # Ensure frequencies are within Nyquist limit

# Generate random noise for each octave band
octave_noises = []
for i in range(len(f_octaves) - 1):
    low_freq = f_octaves[i]
    high_freq = f_octaves[i + 1]
    noise_band = np.random.randn(N, N)  # Generate random noise
    octave_noises.append(noise_band)

# Combine octave band noises
image = np.zeros((N, N))
for i in range(len(octave_noises)):
    image += octave_noises[i]

# Normalize image to [0, 1]
image = (image - np.min(image)) / (np.max(image) - np.min(image))

plt.imsave(fname='assets/textures/noise.png', arr=image, cmap='gray_r', format='png')
