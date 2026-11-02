import pytest

from app.pipeline.language import detect_language
from app.pipeline.segmenter import split_clauses


@pytest.mark.parametrize("text,code", [
    ("I really like my team but the workload has become difficult.", "en"),
    ("J'aime beaucoup mon équipe mais la charge de travail est trop élevée.", "fr"),
    ("أحب الفريق لكن الضغط كبير جدا", "ar"),
])
def test_detects_supported_languages(text, code):
    lang = detect_language(text)
    assert lang.code == code and not lang.experimental


def test_arabizi_is_flagged_experimental():
    lang = detect_language("barcha khedma w flous ma3andhomch mochkla")
    assert lang.code == "ar" and lang.script == "latin"
    assert lang.dialect == "tunisian_arabizi" and lang.experimental


def test_tunisian_arabic_markers_flagged():
    lang = detect_language("الخدمة باهي برشا")
    assert lang.code == "ar" and lang.experimental


def test_plain_french_is_not_arabizi():
    assert not detect_language("Le management est très bon").experimental


@pytest.mark.parametrize("text,n", [
    ("I love the team but the workload is too high.", 2),
    ("J'aime mon équipe mais la charge de travail est trop élevée.", 2),
    ("أحب الفريق لكن الضغط كبير جدا", 2),
    ("Although the salary is good, the workload is heavy.", 2),
    ("The team is great and the workload is heavy.", 2),
    ("The office is clean, quiet, bright.", 1),
])
def test_split_clauses(text, n):
    assert len(split_clauses(text)) == n
