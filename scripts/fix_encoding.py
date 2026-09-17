with open('src/lib/data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix UTF-8 characters that were double-encoded / decoded as Windows-1252
fixed = text.replace('â€”', '—')
fixed = fixed.replace('â€“', '–')
fixed = fixed.replace('â‚¹', '₹')
fixed = fixed.replace('â€™', "'")
fixed = fixed.replace('â€˜', "'")
fixed = fixed.replace('â€œ', '"')
fixed = fixed.replace('â€', '"')

with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(fixed)

print('Cleaned mojibake successfully.')
