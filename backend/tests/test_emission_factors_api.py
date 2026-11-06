
import unittest

from fastapi.testclient import TestClient

from app.main import app


class TestEmissionFactorAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_factor_list(self):
        response = self.client.get(
            "/api/simulator/factors"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertGreaterEqual(data["count"], 1)
        self.assertTrue(
            any(
                factor["country_code"] == "POL"
                for factor in data["factors"]
            )
        )

    def test_poland_factor(self):
        response = self.client.get(
            "/api/simulator/factors/POL"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertTrue(data["available"])
        self.assertEqual(data["factor"]["source"], "KOBiZE")
        self.assertEqual(data["factor"]["year"], 2024)
        self.assertAlmostEqual(
            data["factor"]["value"],
            0.553,
        )

    def test_germany_not_yet_supported(self):
        response = self.client.get(
            "/api/simulator/factors/DEU"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertFalse(data["available"])
        self.assertIsNone(data["factor"])

    def test_simulator_still_works(self):
        response = self.client.post(
            "/api/simulator",
            json={
                "country_code": "POL",
                "annual_electricity_kwh": 10000,
                "electricity_price_per_kwh": 0.9,
                "reduction_percentage": 20,
                "currency": "PLN",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertAlmostEqual(
            response.json()["baseline_emissions_tonnes"],
            5.53,
        )


if __name__ == "__main__":
    unittest.main()
