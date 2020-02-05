from . import apps

class Direction:
    def get_control(direct):
        if direct == "forward":
            return ForwardDir
        elif direct == "back":
            return BackDir
        elif direct == "right":
            return RightDir
        elif direct == "left":
            return LeftDir
        else:
            return

class LeftDir():
    def action():
        apps.turn_val -= 1

class RightDir():
    def action():
        apps.turn_val += 1

class ForwardDir():
    def action():
        apps.forward_val += 1

class BackDir():
    def action():
        apps.forward_val -= 1
