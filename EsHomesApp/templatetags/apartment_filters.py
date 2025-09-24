from django import template

register = template.Library()

@register.filter
def split_paragraphs(text):
    """Split text into paragraphs by double newlines."""
    if not text:
        return []
    return [p.strip() for p in text.split('\n\n') if p.strip()]

@register.filter
def get_range(value):
    """Generate a range from 1 to value."""
    try:
        value = int(value)
        return range(1, value + 1)
    except (ValueError, TypeError):
        return range(1)