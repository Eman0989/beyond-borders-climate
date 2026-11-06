
import unittest

from fastapi import HTTPException
from pydantic import ValidationError

from app.models.simulator import SimulationRequest
from app.services.simulator_service import calculate_emissions


class TestSMEClimateSimulator(unittest.TestCase):

    def test_poland_official_factor(self):
        request = SimulationRequest(
            country_code="POL",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.90,
            reduction_percentage=20,
            currency="PLN",
        )

        result = calculate_emissions(request)

        self.assertEqual(result.factor_source, "KOBiZE")
        self.assertEqual(result.factor_year, 2024)
        self.assertAlmostEqual(
            result.emission_factor_kg_co2e_per_kwh,
            0.553,
        )

        self.assertAlmostEqual(
            result.baseline_emissions_tonnes,
            5.53,
        )

        self.assertAlmostEqual(
            result.scenario_emissions_tonnes,
            4.424,
        )

        self.assertAlmostEqual(
            result.avoided_emissions_tonnes,
            1.106,
        )

    def test_financial_savings(self):
        request = SimulationRequest(
            country_code="POL",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.90,
            reduction_percentage=20,
        )

        result = calculate_emissions(request)

        self.assertEqual(
            result.baseline_electricity_cost,
            9000,
        )

        self.assertEqual(
            result.scenario_electricity_cost,
            7200,
        )

        self.assertEqual(
            result.annual_cost_savings,
            1800,
        )

    def test_zero_reduction(self):
        request = SimulationRequest(
            country_code="POL",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.90,
            reduction_percentage=0,
        )

        result = calculate_emissions(request)

        self.assertEqual(
            result.avoided_emissions_tonnes,
            0,
        )

        self.assertEqual(
            result.annual_cost_savings,
            0,
        )

    def test_full_reduction(self):
        request = SimulationRequest(
            country_code="POL",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.90,
            reduction_percentage=100,
        )

        result = calculate_emissions(request)

        self.assertEqual(
            result.scenario_emissions_tonnes,
            0,
        )

        self.assertEqual(
            result.annual_cost_savings,
            9000,
        )

    def test_custom_factor(self):
        request = SimulationRequest(
            country_code="DEU",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.30,
            reduction_percentage=20,
            emission_factor_kg_co2e_per_kwh=0.40,
            currency="EUR",
        )

        result = calculate_emissions(request)

        self.assertEqual(
            result.factor_source,
            "User-provided assumption",
        )

        self.assertEqual(
            result.factor_year,
            None,
        )

        self.assertAlmostEqual(
            result.baseline_emissions_tonnes,
            4.0,
        )

        self.assertAlmostEqual(
            result.avoided_emissions_tonnes,
            0.8,
        )

    def test_unsupported_country_without_factor(self):
        request = SimulationRequest(
            country_code="PAK",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.20,
            reduction_percentage=20,
        )

        with self.assertRaises(HTTPException) as error:
            calculate_emissions(request)

        self.assertEqual(
            error.exception.status_code,
            422,
        )

    def test_invalid_reduction_percentage(self):
        with self.assertRaises(ValidationError):
            SimulationRequest(
                country_code="POL",
                annual_electricity_kwh=10000,
                electricity_price_per_kwh=0.90,
                reduction_percentage=120,
            )

    def test_negative_electricity(self):
        with self.assertRaises(ValidationError):
            SimulationRequest(
                country_code="POL",
                annual_electricity_kwh=-100,
                electricity_price_per_kwh=0.90,
                reduction_percentage=20,
            )

    def test_country_code_normalization(self):
        request = SimulationRequest(
            country_code="pol",
            annual_electricity_kwh=10000,
            electricity_price_per_kwh=0.90,
            reduction_percentage=20,
        )

        self.assertEqual(
            request.country_code,
            "POL",
        )

    def test_zero_electricity(self):
        request = SimulationRequest(
            country_code="POL",
            annual_electricity_kwh=0,
            electricity_price_per_kwh=0.90,
            reduction_percentage=20,
        )

        result = calculate_emissions(request)

        self.assertEqual(
            result.baseline_emissions_tonnes,
            0,
        )

        self.assertEqual(
            result.avoided_emissions_tonnes,
            0,
        )

        self.assertEqual(
            result.annual_cost_savings,
            0,
        )


if __name__ == "__main__":
    unittest.main()
