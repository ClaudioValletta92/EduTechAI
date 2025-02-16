from decouple import config
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

# Configure Google API
genai.configure(api_key=config("GEMINI_API_KEY"))

# Default generation config
GENERATION_CONFIG = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

def generate_response_from_google(prompt):
    """
    Calls Google Gemini API with the given prompt and returns the response text along with token usage.
    """
    try:
        model = genai.GenerativeModel(
            model_name="models/gemini-1.5-flash",
            generation_config=GENERATION_CONFIG,
        )

        # ✅ First, count input tokens before making the request
        token_info = model.count_tokens(prompt)
        input_tokens = token_info.total_tokens if token_info else None

        # Send user input to the model
        response = model.generate_content(prompt)

        # ✅ Extract token usage properly from `usage_metadata`
        usage_metadata = getattr(response, "usage_metadata", None)
        
        prompt_tokens = usage_metadata.prompt_token_count if usage_metadata else None
        response_tokens = usage_metadata.candidates_token_count if usage_metadata else None
        total_tokens = usage_metadata.total_token_count if usage_metadata else None

        logger.info(f"Token Usage - Prompt: {prompt_tokens}, Response: {response_tokens}, Total: {total_tokens}")

        return {
            "text": response.text if response.text else None,
            "input_tokens": prompt_tokens,
            "output_tokens": response_tokens,
        }

    except Exception as e:
        logger.error(f"Error calling Google Gemini API: {e}")
        return {"text": None, "input_tokens": None, "output_tokens": None, "total_tokens": None}