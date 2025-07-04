import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face client
const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  style?: string;
  aspectRatio?: string;
  steps?: number;
  guidance?: number;
}

export class AIImageService {
  private static instance: AIImageService;
  
  public static getInstance(): AIImageService {
    if (!AIImageService.instance) {
      AIImageService.instance = new AIImageService();
    }
    return AIImageService.instance;
  }

  private enhancePrompt(prompt: string, style: string): string {
    const styleEnhancements = {
      'realistic': 'photorealistic, high quality, detailed, 8k resolution',
      'artistic': 'artistic, painterly, creative, expressive',
      'anime': 'anime style, manga, japanese animation, cel shading',
      'abstract': 'abstract art, non-representational, geometric, modern',
      'digital-art': 'digital art, concept art, artstation trending',
      'oil-painting': 'oil painting, classical art, renaissance style, textured brushstrokes',
      'watercolor': 'watercolor painting, soft colors, flowing, artistic medium',
      'cyberpunk': 'cyberpunk, neon lights, futuristic, sci-fi, dystopian'
    };

    const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || '';
    return `${prompt}, ${enhancement}`;
  }

  private getDimensions(aspectRatio: string): { width: number; height: number } {
    const ratios = {
      '1:1': { width: 512, height: 512 },
      '16:9': { width: 768, height: 432 },
      '9:16': { width: 432, height: 768 },
      '4:3': { width: 640, height: 480 }
    };
    
    return ratios[aspectRatio as keyof typeof ratios] || ratios['1:1'];
  }

  async generateImage(options: ImageGenerationOptions): Promise<Blob> {
    try {
      const enhancedPrompt = this.enhancePrompt(options.prompt, options.style || 'realistic');
      const dimensions = this.getDimensions(options.aspectRatio || '1:1');
      
      // Build the full prompt with negative prompts
      let fullPrompt = enhancedPrompt;
      if (options.negativePrompt) {
        fullPrompt += ` ### Negative: ${options.negativePrompt}`;
      }

      console.log('Generating image with prompt:', fullPrompt);
      
      const response = await hf.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: fullPrompt,
        parameters: {
          width: dimensions.width,
          height: dimensions.height,
          num_inference_steps: options.steps || 30,
          guidance_scale: options.guidance || 7.5,
        }
      });

      return response;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image. Please check your API key and try again.');
    }
  }

  async generateMultipleImages(options: ImageGenerationOptions, count: number = 4): Promise<Blob[]> {
    const promises = Array(count).fill(null).map(() => this.generateImage(options));
    
    try {
      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<Blob> => result.status === 'fulfilled')
        .map(result => result.value);
      
      if (successfulResults.length === 0) {
        throw new Error('Failed to generate any images');
      }
      
      return successfulResults;
    } catch (error) {
      console.error('Error generating multiple images:', error);
      throw error;
    }
  }

  blobToFile(blob: Blob, filename: string = 'ai-generated-image.png'): File {
    return new File([blob], filename, { type: blob.type || 'image/png' });
  }

  async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const aiImageService = AIImageService.getInstance();