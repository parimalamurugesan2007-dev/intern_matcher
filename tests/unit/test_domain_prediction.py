from src.domain.predict import DomainPredictor

def test_domain_prediction():
    predictor = DomainPredictor()

    domain = predictor.predict(
        "Python Machine Learning SQL Flask"
    )

    assert isinstance(domain, str)
    assert len(domain) > 0