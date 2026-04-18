import os, re

files_to_update = {
    "src/pages/ExpenseManagement.jsx": {
        "imports": {"add": "import { useCurrency } from \"../contexts/CurrencyContext\";", "position": 27},
        "remove_dup_format": True,
        "format_cells": [
            {"line": 307, "pattern": r'^\s*<\$>\s*\$\{.*?\}\s*</p>', "replacement": None, "type": "card_approve"},
            {"line": 334, "pattern": None, "type": "card_pending"},
        ],
        "form_label": {"line": 431, "old": "Amount ($)", "new": "Amount ({currency_symbol})"},
        "form_input_prefix": {"line": 122, "old": 'prefix="$"', "new": 'prefix="{currency_symbol}"'},
    }
}

