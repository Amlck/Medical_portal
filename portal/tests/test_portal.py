import importlib.util
import sys
import unittest
from pathlib import Path


def load_module(module_name: str, file_path: Path):
    sys.path.insert(0, str(file_path.parent))
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class PortalAppTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.portal_dir = Path(__file__).resolve().parents[1]
        cls.module = load_module("mediport_public_portal_app", cls.portal_dir / "app.py")
        cls.module.app.template_folder = str(cls.portal_dir / "templates")
        cls.module.app.static_folder = str(cls.portal_dir / "static")
        cls.module.app.jinja_loader.searchpath = [str(cls.portal_dir / "templates")]
        cls.module.app.testing = True
        cls.client = cls.module.app.test_client()

    def test_index_renders_expected_anchors_and_scripts(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        for anchor in (
            'id="views-wrapper"',
            'id="music-player"',
            'id="view-handoff"',
            'id="view-admissions"',
            'id="view-phi"',
            'id="view-calculator"',
            'id="view-census"',
            'id="view-patient-context"',
            'id="patient-context-panel"',
            'id="shortcut-help-overlay"',
            '/static/js/portal-shell.js?v=',
            '/static/js/portal-phi.js?v=',
            '/static/js/portal-calculators.js?v=',
            '/static/js/portal-patient-context.js?v=',
            '/static/js/portal-music.js?v=',
            '/static/js/portal-nav.js?v=',
        ):
            self.assertIn(anchor, html)
        for removed in (
            'id="view-casemaker"',
            'id="view-abx"',
            'id="view-drugs"',
            'id="drug-panel"',
            '/static/js/portal-abx.js?v=',
            '/static/js/portal-drugs.js?v=',
            '/static/data/abx-data.js?v=',
            '/static/data/drug-data.js?v=',
        ):
            self.assertNotIn(removed, html)

    def test_status_endpoint_exposes_core_services(self):
        response = self.client.get("/api/status")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn("handoff", payload)
        self.assertIn("admissions", payload)
        self.assertIn("phi_remover", payload)
        self.assertIn("alive", payload["handoff"])

    def test_static_assets_and_music_endpoint_are_served(self):
        for path in (
            "/api/music",
            "/static/js/portal-shell.js",
            "/static/js/portal-phi.js",
            "/static/js/portal-calculators.js",
            "/static/js/portal-patient-context.js",
            "/static/js/portal-music.js",
            "/static/js/portal-nav.js",
        ):
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                response.close()

        for path in (
            "/static/data/abx-data.js",
            "/static/data/drug-data.js",
            "/static/js/portal-abx.js",
            "/static/js/portal-drugs.js",
        ):
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 404)
                response.close()


if __name__ == "__main__":
    unittest.main()
