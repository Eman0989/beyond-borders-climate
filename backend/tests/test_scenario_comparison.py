
import unittest

from fastapi.testclient import TestClient

from app.main import app


class TestScenarioComparison(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_three_scenarios_returned(self):
        response = self.client.post(
            "/api/simulator/compare",
            json={
                "country_code": "DEU",
                "annual_electricity_kwh": 10000,
                "electricity_price_per_kwh": 0.30,
                "currency": "EUR",
            },
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            len(data["scenarios"]),
            3,
        )

        self.assertEqual(
            [
                item["reduction_percentage"]
                for item in data["scenarios"]
            ],
            [10, 20, 40],
        )

    def test_germany_scenario_results(self):
        response = self.client.post(
            "/api/simulator/compare",
            json={
                "country_code": "DEU",
                "annual_electricity_kwh": 10000,
                "electricity_price_per_kwh": 0.30,
                "currency": "EUR",
            },
        )

        self.assertEqual(response.status_code, 200)

        scenarios = response.json()["scenarios"]

        expected_emissions = [0.353, 0.706, 1.412]
        expected_savings = [300, 600, 1200]

        for index, scenario in enumerate(scenarios):
            calculation = scenario["calculation"]

            self.assertAlmostEqual(
                calculation["avoided_emissions_tonnes"],
                expected_emissions[index],
            )

            self.assertAlmostEqual(
                calculation["annual_cost_savings"],
                expected_savings[index],
            )

    def test_custom_factor_for_pakistan(self):
        response = self.client.post(
            "/api/simulator/compare",
            json={
                "country_code": "PAK",
                "annual_electricity_kwh": 10000,
                "electricity_price_per_kwh": 40,
                "currency": "PLN",
                "emission_factor_kg_co2e_per_kwh": 0.5,
            },
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(data["country_code"], "PAK")

        self.assertEqual(
            len(data["scenarios"]),
            3,
        )

        self.assertEqual(
            data["scenarios"][0]["calculation"][
                "factor_source"
            ],
            "User-provided assumption",
        )

    def test_missing_factor_rejected(self):
        response = self.client.post(
            "/api/simulator/compare",
            json={
                "country_code": "PAK",
                "annual_electricity_kwh": 10000,
                "electricity_price_per_kwh": 40,
                "currency": "PLN",
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_invalid_consumption_rejected(self):
        response = self.client.post(
            "/api/simulator/compare",
            json={
                "country_code": "DEU",
                "annual_electricity_kwh": -100,
                "electricity_price_per_kwh": 0.30,
                "currency": "EUR",
            },
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
