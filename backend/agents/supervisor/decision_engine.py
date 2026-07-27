from typing import Dict, Any

class DecisionEngine:
    def __init__(self, weights: Dict[str, float] = None):
        # Default weights as specified in Phase 9 requirements
        self.weights = weights or {
            "technical-analysis": 0.30,
            "sentiment-analysis": 0.20,
            "research": 0.15,
            "risk-management": 0.20,
            "portfolio-allocation": 0.10,
            "reflection-agent": 0.05
        }

    def evaluate(self, agent_outputs: Dict[str, Any]) -> Dict[str, Any]:
        """Simple weighted voting algorithm to aggregate decisions."""
        # Filter for agents that actually provided non-None outputs
        active_outputs = {k: v for k, v in agent_outputs.items() if v is not None}
        
        # Calculate normalized weights for active agents
        active_weights = {k: self.weights.get(k, 0.0) for k in active_outputs}
        total_weight = sum(active_weights.values())
        
        if total_weight > 0:
            normalized_weights = {k: v / total_weight for k, v in active_weights.items()}
        else:
            normalized_weights = {}

        weighted_score = 0.0
        confidence_sum = 0.0
        reasons = []

        # Map signal types to numeric values
        signal_mapping = {"BUY": 1.0, "SELL": -1.0, "HOLD": 0.0}

        for agent_id, output in active_outputs.items():
            weight = normalized_weights.get(agent_id, 0.0)
            
            # Extract signal and confidence
            signal_type = "HOLD"
            confidence = 50.0
            
            if isinstance(output, dict):
                signal_type = output.get("signal_type", output.get("action"))
                if not signal_type:
                    # Non-directional agents handling
                    if "allowed" in output:
                        signal_type = "HOLD" if output["allowed"] else "HOLD"
                    else:
                        signal_type = "HOLD"
                confidence = output.get("confidence", 50.0)
                reasoning = output.get("reasoning", "")
            else:
                # Fallback if AgentSignal object or other object
                signal_type = getattr(output, "signal_type", getattr(output, "action", "HOLD"))
                confidence = getattr(output, "confidence", 50.0)
                reasoning = getattr(output, "reasoning", "")

            signal_val = signal_mapping.get(signal_type.upper(), 0.0)
            weighted_score += signal_val * weight
            confidence_sum += confidence * weight
            reasons.append(f"{agent_id}: {signal_type} ({confidence}%)")

        # Determine final action based on weighted score threshold
        if weighted_score > 0.15:
            final_action = "BUY"
        elif weighted_score < -0.15:
            final_action = "SELL"
        else:
            final_action = "HOLD"

        return {
            "action": final_action,
            "confidence": round(confidence_sum, 2) if active_outputs else 50.0,
            "reasoning": f"Consensus reached via weights. Components evaluated: {'; '.join(reasons)}" if reasons else "No active agent signals available."
        }
