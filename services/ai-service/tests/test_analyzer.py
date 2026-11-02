def _aspects(result):
    return {a["key"]: a["sentiment"] for a in result["aspects"]}


def test_brief_example_is_mixed_with_team_positive_workload_negative(analyzer):
    r = analyzer.analyze("I love the team but the workload is too high.")
    assert r["sentiment"]["label"] == "mixed"
    assert _aspects(r)["team"] == "positive" and _aspects(r)["workload"] == "negative"
    assert 0 < r["sentiment"]["confidence"] <= 1


def test_french_mixed(analyzer):
    r = analyzer.analyze("J'aime mon équipe mais la charge de travail est trop élevée.")
    assert r["sentiment"]["label"] == "mixed"
    assert _aspects(r)["team"] == "positive" and _aspects(r)["workload"] == "negative"


def test_arabic_mixed(analyzer):
    r = analyzer.analyze("أحب الفريق لكن الضغط كبير جدا")
    assert r["language"]["code"] == "ar" and r["sentiment"]["label"] == "mixed"
    assert _aspects(r)["team"] == "positive" and _aspects(r)["workload"] == "negative"


def test_management_communication_negative(analyzer):
    r = analyzer.analyze("The team is great but communication with management is poor.")
    a = _aspects(r)
    assert a["team"] == "positive" and a["communication"] == "negative" and a["management"] == "negative"


def test_positive_negative_neutral(analyzer):
    assert analyzer.analyze("The training programme is excellent.")["sentiment"]["label"] == "positive"
    assert analyzer.analyze("The salary is terrible.")["sentiment"]["label"] == "negative"
    assert analyzer.analyze("The meeting is on Tuesday.")["sentiment"]["label"] == "neutral"


def test_negation_flips_polarity(analyzer):
    assert analyzer.analyze("The management is not good.")["sentiment"]["label"] == "negative"


def test_emotions_are_a_distribution_over_the_eight_labels(analyzer):
    r = analyzer.analyze("I am frustrated by the constant pressure.")
    labels = {e["label"] for e in r["emotions"]["scores"]}
    assert labels == {"joy", "satisfaction", "frustration", "anger", "sadness", "fear", "surprise", "neutral"}
    assert abs(sum(e["score"] for e in r["emotions"]["scores"]) - 1) < 0.01
    assert r["emotions"]["primary"] == "frustration"


def test_arabizi_reduces_confidence_and_warns(analyzer):
    r = analyzer.analyze("mochkla kbira fi khedma, barcha ta3ab")
    assert r["language"]["experimental"] is True
    assert any("EXPERIMENTAL" in w for w in r["meta"]["warnings"])


def test_emergent_aspect_detected(analyzer):
    r = analyzer.analyze("The parking situation is terrible.")
    emergent = [a for a in r["aspects"] if a["type"] == "emergent"]
    assert emergent and emergent[0]["sentiment"] == "negative"


def test_batch_matches_single(analyzer):
    texts = ["I love the team but the workload is too high.", "Le salaire est mauvais."]
    batch = analyzer.analyze_many([(t, None) for t in texts])
    for t, b in zip(texts, batch):
        assert analyzer.analyze(t)["sentiment"]["label"] == b["sentiment"]["label"]
