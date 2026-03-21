from langgraph.graph import StateGraph, END

from .nodes import ingest_data, assess_risk, communicate, plan_discharge
from .state import PatientState

workflow = StateGraph(PatientState)

workflow.add_node("ingest_data", ingest_data)
workflow.add_node("assess_risk", assess_risk)
workflow.add_node("communicate", communicate)
workflow.add_node("plan_discharge", plan_discharge)

workflow.set_entry_point("ingest_data")
workflow.add_edge("ingest_data", "assess_risk")
workflow.add_edge("assess_risk", "communicate")

workflow.add_conditional_edges(
    "communicate",
    lambda s: "plan_discharge" if s.get("discharge_flag") else END,
    {"plan_discharge": "plan_discharge", END: END},
)
workflow.add_edge("plan_discharge", END)

graph = workflow.compile()
