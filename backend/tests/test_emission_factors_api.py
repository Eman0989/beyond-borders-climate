
import unittest

from fastapi.testclient import TestClient

from app.main import app


class TestEmissionFactorAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # =====================================
    # TEST 1 — AVAILABLE FACTOR LIST
    # =====================================

    def test_factor_list(self):
        response = self.client.get(
            "/api/simulator/factors"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(data["count"], 2)
        self.assertEqual(
            len(data["factors"]),
            2,
        )

        codes = {
            factor["country_code"]
            for factor in data["factors"]
        }

        self.assertEqual(
            codes,
            {"POL", "DEU"},
        )

    # =====================================
    # TEST 2 — POLAND FACTOR
    # =====================================

    def test_poland_factor(self):
        response = self.client.get(
            "/api/simulator/factors/POL"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertTrue(data["available"])

        self.assertEqual(
            data["country_code"],
            "POL",
        )

        self.assertEqual(
            data["factor"]["source"],
            "KOBiZE",
        )

        self.assertEqual(
            data["factor"]["year"],
            2024,
        )

        self.assertAlmostEqual(
            data["factor"]["value"],
            0.553,
        )

        self.assertEqual(
            data["factor"]["unit"],
            "kg CO2/kWh",
        )

        self.assertTrue(
            data["factor"]["source_url"].startswith(
                "https://"
            )
        )

    # =====================================
    # TEST 3 — GERMANY FACTOR
    # =====================================

    def test_germany_factor(self):
        response = self.client.get(
            "/api/simulator/factors/DEU"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertTrue(data["available"])

        self.assertEqual(
            data["country_code"],
            "DEU",
        )

        self.assertEqual(
            data["factor"]["source"],
            "Umweltbundesamt (UBA)",
        )

        self.assertEqual(
            data["factor"]["year"],
            2024,
        )

        self.assertAlmostEqual(
            data["factor"]["value"],
            0.353,
        )

        self.assertEqual(
            data["factor"]["unit"],
            "kg CO2/kWh",
        )

        self.assertTrue(
            data["factor"]["source_url"].startswith(
                "https://"
            )
        )

    # =====================================
    # TEST 4 — UNSUPPORTED COUNTRY
    # =====================================

    def test_pakistan_not_yet_supported(self):
        response = self.client.get(
            "/api/simulator/factors/PAK"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            data["country_code"],
            "PAK",
        )

        self.assertFalse(
            data["available"]
        )

        self.assertIsNone(
            data["factor"]
        )

    # =====================================
    # TEST 5 — POLAND SIMULATION
    # =====================================

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

        data = response.json()

        self.assertEqual(
            data["factor_source"],
            "KOBiZE",
        )

        self.assertAlmostEqual(
            data["baseline_emissions_tonnes"],
            5.53,
        )

        self.assertAlmostEqual(
            data["scenario_emissions_tonnes"],
            4.424,
        )

        self.assertAlmostEqual(
            data["avoided_emissions_tonnes"],
            1.106,
        )

        self.assertAlmostEqual(
            data["annual_cost_savings"],
            1800,
        )

    # =====================================
    # TEST 6 — GERMANY SIMULATION
    # =====================================

    def test_germany_simulation(self):
        response = self.client.post(
            "/api/simulator",
            json={
                "country_code": "DEU",
                "annual_electricity_kwh": 10000,
                "electricity_price_per_kwh": 0.30,
                "reduction_percentage": 20,
                "currency": "EUR",
            },
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            data["factor_source"],
            "Umweltbundesamt (UBA)",
        )

        self.assertAlmostEqual(
            data["baseline_emissions_tonnes"],
            3.53,
        )

        self.assertAlmostEqual(
            data["scenario_emissions_tonnes"],
            2.824,
        )

        self.assertAlmostEqual(
            data["avoided_emissions_tonnes"],
            0.706,
        )

        self.assertAlmostEqual(
            data["annual_cost_savings"],
            600,
        )


if __name__ == "__main__":
    unittest.main()
