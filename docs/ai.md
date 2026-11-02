# AI / NLP service

Pipeline per feedback text: language detection -> clause segmentation -> per-clause sentiment ->
aspect matching per clause -> overall sentiment (Mixed rule) -> zero-shot emotions on the full text.

| Task | Model / method | Notes |
|---|---|---|
| Language | `lingua-language-detector` (FR/EN/AR) + script rules | Offline. Arabizi and Tunisian markers are heuristics, flagged `experimental`. |
| Sentiment | `cardiffnlp/twitter-xlm-roberta-base-sentiment` | 3-class multilingual XLM-R. |
| Emotions | `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` (zero-shot) | Custom labels: joy, satisfaction, frustration, anger, sadness, fear, surprise, neutral. Scores are normalised to sum to 1. |
| Aspects (fixed) | Multilingual seed lexicon (12 aspects) | Deterministic and explainable. |
| Aspects (semantic) | `intfloat/multilingual-e5-small` embeddings (`AI_MODEL_PROFILE=full`) | Threshold `AI_EMBED_MATCH_THRESHOLD` is NOT calibrated: tune on labelled data before trusting. |
| Emergent aspects | Heuristic: first content words of an unmatched polar clause | Latin script only, marked `type: emergent`; HR approves/merges them. |

## Mixed sentiment rule
A text is `mixed` when at least one clause is confidently positive AND one is confidently negative
(confidence >= `AI_CONFIDENT_THRESHOLD`, default 0.55). Confidence = min(best positive, best negative).

## Engines
`AI_ENGINE=transformers` (default, Docker) uses the real models. `AI_ENGINE=lexicon` is a rule-based
development fallback used by unit tests; every response reports `meta.engine` and adds a warning when
it is active. It is never the Docker default.

## Model licences and availability: TO VERIFY BEFORE THE DEFENCE
The build sandbox has no access to huggingface.co, so licences and availability were NOT verified
here. Open each model card, note the licence and confirm the model still exists, then record it below:

- [ ] cardiffnlp/twitter-xlm-roberta-base-sentiment: licence: ____ verified on: ____
- [ ] MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7: licence: ____ verified on: ____
- [ ] intfloat/multilingual-e5-small: licence: ____ verified on: ____

## Limitations (say them out loud in the demo)
- Tunisian dialect / Arabizi: experimental, reduced confidence (x0.7), visible warning.
- Sarcasm, very short texts and domain slang are unreliable.
- The service scores the CONTENT of feedback. It never scores or diagnoses people.
- Real-model tests: `AI_RUN_MODEL_TESTS=1 pytest tests/test_transformers_engine.py` (needs torch + HF access).
