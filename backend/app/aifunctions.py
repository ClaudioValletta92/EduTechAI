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
            model_name="gemini-1.5-flash-8b",
            generation_config=GENERATION_CONFIG,
        )

        chat_session = model.start_chat(history=[])

        # Send user input to the model
        response = chat_session.send_message(prompt)

        # Extract token usage (if available)
        token_usage = response.usage if hasattr(response, "usage") else None

        input_tokens = token_usage.input_tokens if token_usage else None
        output_tokens = token_usage.output_tokens if token_usage else None

        # Log token usage for tracking
        logger.info(f"📊 Token Usage - Input: {input_tokens}, Output: {output_tokens}")

        return {
            "text": response.text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }

    except Exception as e:
        logger.error(f"Error calling Google Gemini API: {e}")
        return {"text": None, "input_tokens": None, "output_tokens": None}
