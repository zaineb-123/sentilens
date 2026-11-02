"""Workplace aspect catalog: multilingual seed lexicon (FR / EN / AR / Tunisian Arabizi).

The 12 fixed aspects come from the project brief. Terms are matched after normalization
(see matching.TermSet). Emergent aspects are handled separately in the analyzer.
"""
from dataclasses import dataclass

from .matching import TermSet
from .text_utils import tokenize


def _t(s: str) -> list[str]:
    return [x for x in s.split("|") if x]


ASPECTS: dict[str, dict] = {
    "workload": {
        "label": {"en": "Workload", "fr": "Charge de travail", "ar": "عبء العمل"},
        "description": "Amount of work, deadlines, pressure, understaffing and overload.",
        "terms": _t("workload|overwork|too much work|deadline|overload|understaff|staffing|pressure|"
                    "charge de travail|surcharge|trop de travail|delai|sous-effectif|pression|"
                    "عبء العمل|ضغط|ضغوط|كثرة العمل|الاعباء|أعباء|barcha khedma|ta3ab"),
    },
    "salary_benefits": {
        "label": {"en": "Salary & benefits", "fr": "Salaire & avantages", "ar": "الراتب والمزايا"},
        "description": "Salary, pay, bonuses, insurance and employee benefits.",
        "terms": _t("salary|salaries|wage|compensation|benefit|bonus|pay!|paid!|payroll|pension|insurance|"
                    "salaire|remuneration|paie!|prime!|primes|avantage|augmentation|mutuelle|assurance|"
                    "راتب|رواتب|اجور|أجرة|علاوة|مكافأة|تأمين|flous"),
    },
    "management": {
        "label": {"en": "Management", "fr": "Management", "ar": "الإدارة"},
        "description": "Managers, supervisors, leadership and hierarchy.",
        "terms": _t("management|manager|boss|supervisor|leadership|director!|hierarchy|direction|"
                    "responsable|chef!|hierarchie|encadrement|superieur|"
                    "الإدارة|إدارة|مدير|رئيس|المسؤول|القيادة|idara|moudir"),
    },
    "communication": {
        "label": {"en": "Communication", "fr": "Communication", "ar": "التواصل"},
        "description": "Internal communication, transparency and information sharing.",
        "terms": _t("communicat|transparen|information|informed|in the loop|announce|communiq|"
                    "informe|annonce|التواصل|تواصل|الشفافية|معلومات|إعلام"),
    },
    "team": {
        "label": {"en": "Team", "fr": "Équipe", "ar": "الفريق"},
        "description": "Colleagues, teamwork and relationships with coworkers.",
        "terms": _t("team|colleague|coworker|co-worker|teammate|peers!|equipe!|equipes|collegue|"
                    "collaborateur|فريق|زملاء|زميل|zmayel"),
    },
    "work_environment": {
        "label": {"en": "Work environment", "fr": "Environnement de travail", "ar": "بيئة العمل"},
        "description": "Office space, atmosphere, culture, noise, facilities and cleanliness.",
        "terms": _t("environment|environnement|office!|offices|workspace|atmosphere|culture|noise|open space|"
                    "facilities|cafeteria|canteen|air conditioning|cleanliness|bureau!|bureaux|locaux|"
                    "ambiance|climatisation|cantine|espace de travail|bruit|بيئة|مكتب|أجواء|ثقافة|"
                    "مكان العمل|ضجيج"),
    },
    "career_development": {
        "label": {"en": "Career development", "fr": "Évolution de carrière", "ar": "التطور المهني"},
        "description": "Promotions, career growth, advancement opportunities and prospects.",
        "terms": _t("career|promotion|growth|advancement|progression|opportunit|prospect|carriere|evolution|"
                    "perspective|avancement|مسار مهني|ترقية|ترقيات|فرص|تطور|مستقبل مهني"),
    },
    "training": {
        "label": {"en": "Training", "fr": "Formation", "ar": "التدريب"},
        "description": "Training, courses, workshops, mentoring and learning opportunities.",
        "terms": _t("training|courses|workshop|upskill|mentor|learning|formation|atelier|apprentissage|"
                    "تدريب|تدريبات|تكوين|دورات|ورشات"),
    },
    "recognition": {
        "label": {"en": "Recognition", "fr": "Reconnaissance", "ar": "التقدير"},
        "description": "Feeling valued, recognized, thanked and rewarded for work.",
        "terms": _t("recogni|appreci|valued|acknowledg|reward|praise|thank|reconnaissance|reconnu|valoris|"
                    "felicit|remerci|recompense|تقدير|اعتراف|تحفيز|حوافز|شكر|تكريم"),
    },
    "work_life_balance": {
        "label": {"en": "Work-life balance", "fr": "Équilibre vie pro/perso", "ar": "التوازن بين العمل والحياة"},
        "description": "Working hours, overtime, flexibility, remote work and time off.",
        "terms": _t("work-life|work life|balance|overtime|weekend|week-end|evening|flexib|remote|telework|"
                    "vacation|leave!|hours|equilibre|vie privee|vie personnelle|heures sup|teletravail|"
                    "conge|horaire|توازن|الحياة الشخصية|ساعات إضافية|عطلة|عطل|العمل عن بعد|الدوام|"
                    "ساعات العمل|إجازة"),
    },
    "tools_technology": {
        "label": {"en": "Tools & technology", "fr": "Outils & technologie", "ar": "الأدوات والتكنولوجيا"},
        "description": "Software, equipment, computers, internet and internal systems.",
        "terms": _t("tool|software|laptop|computer|equipment|technolog|internet|wifi|vpn|application|system|"
                    "outil|logiciel|ordinateur|materiel|equipement|systeme|connexion|"
                    "أدوات|برنامج|برامج|حاسوب|معدات|تجهيزات|تكنولوجيا|انترنت"),
    },
    "workplace_policies": {
        "label": {"en": "Workplace policies", "fr": "Politiques internes", "ar": "سياسات العمل"},
        "description": "Company rules, procedures, processes and bureaucracy.",
        "terms": _t("policy|policies|rules|regulation|procedure|process|bureaucra|dress code|attendance|"
                    "politique|regle|processus|bureaucratie|charte|سياسة|سياسات|قوانين|لوائح|"
                    "إجراءات|بيروقراطية|النظام الداخلي"),
    },
}


@dataclass(frozen=True)
class AspectHit:
    key: str
    label: dict[str, str]


class AspectCatalog:
    def __init__(self) -> None:
        self._sets = {key: TermSet(spec["terms"], ar_allow=2) for key, spec in ASPECTS.items()}

    @property
    def keys(self) -> list[str]:
        return list(ASPECTS)

    def label(self, key: str) -> dict[str, str]:
        return ASPECTS[key]["label"]

    def descriptions(self) -> dict[str, str]:
        return {k: v["description"] for k, v in ASPECTS.items()}

    def match(self, norm: str) -> list[str]:
        tokens = tokenize(norm)
        return [key for key, ts in self._sets.items() if ts.matches(norm, tokens)]
